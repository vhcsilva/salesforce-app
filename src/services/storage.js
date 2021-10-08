import { getDataKey } from './sync';

export const loadDataFromLocalStorage = async (key) => {
    let dataKey = await getDataKey(key);
    let data = localStorage.getItem(dataKey);

    return data === '' ? null : data;
}

export const saveDataToLocalStorage = (key, data) => {
    let dataKey = getDataKey(key);

    dataKey.then( rs => {
        localStorage.setItem(rs, JSON.stringify(data));
    });
}