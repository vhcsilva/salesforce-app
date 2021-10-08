import Dexie from 'dexie';
import { getDataKey } from './sync';

export const loadDataFromIndexedDB = async (key, filter = null) => {
    let data = [];
    let dataKey = await getDataKey(key);
    let userKey = await getDataKey('username');
    let exists = await Dexie.exists(`${userKey}-televendas`);

    if (exists) {
        const DB = await new Dexie(`${userKey}-televendas`).open();
    
        let table = DB.tables.filter(table => table.name == key)[0];

        data = await table.where('id').aboveOrEqual(0).toArray();

        if (filter)
            data = data.filter(filter);
    }
    
    return data;
}

export const saveDataToIndexedDB = async (table_name, data) => {
    let userKey = await getDataKey('username');
    let exists = await Dexie.exists(`${userKey}-televendas`);
    
    if (exists) {
        let DB = await new Dexie(`${userKey}-televendas`).open();
        let table = DB.tables.filter(table => table.name == table_name)[0];

        let updated = await table.update(parseInt(data.id), data);

        if (updated) {
            return true;
        } else {
            let added = await table.add(data, parseInt(data.id));

            if (added) {
                return true;
            }

            return false;
        }
    }
}

export const deleteDataFromIndexedDB = async (table_name, data) => {
    let userKey = await getDataKey('username');
    let exists = await Dexie.exists(`${userKey}-televendas`);

    if (exists) {
        let DB = await new Dexie(`${userKey}-televendas`).open();
        let table = DB.tables.filter(table => table.name == table_name)[0];

        let deleted = await table.delete(data.id);

        return deleted;
    }
}