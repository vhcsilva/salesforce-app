import api from './api';
import Dexie from 'dexie';

import { ERROR, SYNCHRONIZED } from '../configs/constants';
import { getUsername, login } from './auth'
import { saveDataToIndexedDB } from './db';
import { loadDataFromLocalStorage } from './storage';

const getDataKey = async (key) => {
    let username = await getUsername();

    let keys = {
        'clients': `@${username}-clients`,
        'products': `@${username}-products`,
        'fixedPrices': `@${username}-fixedPrices`,
        'policies': `@${username}-policies`,
        'paymentConditions': `@${username}-paymentConditions`,
        'orders': `@${username}-orders`,
        'username': `@${username}`,
        'user': '@user',
        'refresh_token': '@refresh-token',
        'sync-time': '@sync-time'
    };

    return keys[key];
};

const validateLastSync = async () => {
    let lastSyncStamp = await loadDataFromLocalStorage('sync-time');

    if (lastSyncStamp != null) {
        let lastSyncDate = new Date(parseInt(lastSyncStamp));
        let now = new Date();

        let diffInHours = (now - lastSyncDate) / (1000 * 60);

        if (diffInHours <= 30)
            return true;
    }

    return false;
}

const synchronizeClients = async (DB) => {
    let response = await api.get('/api/v1/clients');

    let clients = response.data;

    DB.clients.where('id').aboveOrEqual(0).delete();

    let rs = await DB.clients.bulkPut(clients);

    return rs;
}

const synchronizeProducts = async (DB) => {
    let response = await api.get('/api/v1/products');

    let products = response.data;

    DB.products.where('id').aboveOrEqual(0).delete();

    let rs = await DB.products.bulkPut(products);

    return rs;
}

const synchronizeFixedPrices = async (DB) => {
    let response = await api.get('/api/v1/fixed_prices');

    let fixed = response.data;

    DB.fixed_prices.where('id').aboveOrEqual(0).delete();

    let rs = await DB.fixed_prices.bulkPut(fixed);

    return rs;
}

const synchronizePolicies = async (DB) => {
    let response = await api.get('/api/v1/policies');

    let policies = response.data;

    DB.policies.where('id').aboveOrEqual(0).delete();

    let rs = await DB.policies.bulkPut(policies);

    return rs;
}

const synchronizePaymentConditions = async (DB) => {
    let response = await api.get('/api/v1/payment_conditions');

    let conditions = response.data;

    DB.paymentConditions.where('id').aboveOrEqual(0).delete();

    let rs = await DB.paymentConditions.bulkPut(conditions);

    return rs;
}

const synchronizeOrders = async (orders) => {
    var userKey = await getDataKey('username');
    var exists = await Dexie.exists(`${userKey}-televendas`);

    if (exists) {
        var DB = await new Dexie(`${userKey}-televendas`).open();
        let tableOrders = DB.tables.filter(table => table.name == 'orders')[0];
        let tableClients = DB.tables.filter(table => table.name == 'clients')[0];

        for (let index = 0; index < orders.length; index++) {
            try {
                let order = orders[index];
                let found = await tableOrders.get(parseInt(order.app_id));
                let client = await tableClients.where({ company: order.unique.substring(0, 2), code: order.unique.substring(4, 10), store: order.unique.substring(10, 12) }).first();
                let tmpOrder = {
                    id: parseInt(order.app_id),
                    pedpalm: order.pedpalm,
                    client: client,
                    items: order.items,
                    sync: true
                };

                await saveDataToIndexedDB('orders', tmpOrder);
            } catch (e) {
                let error = e;
            }
        }

        return true;
    } else {
        return false
    }
}

const dbExists = async () => {
    var userKey = await getDataKey('username');
    var exists = await Dexie.exists(`${userKey}-televendas`);

    return exists;
}

const synchronizeProfile = async (DB, username) => {
    let response = await api.get('/api/v1/sellers', {
        params: {
            username: username.replace('@', '')
        }
    });

    let profile = response.data;
    profile = profile[0];
    profile.sellers = JSON.parse(profile.sellers.replaceAll("'", '"'))

    DB.profile.where('id').aboveOrEqual(0).delete();

    let rs = await DB.profile.bulkPut([profile]);

    return rs;
}

const Synchronization = async () => {
    try {
        let userKey = getDataKey('username');
        let refresh_token = loadDataFromLocalStorage('refresh_token');

        let data = await Promise.all([userKey, refresh_token]);

        let key = data[0].replace('@', '');
        let token = data[1];

        var form = new FormData();

        form.append("username", key);
        form.append("grant_type", "refresh_token");
        form.append("client_id", "67jZAUZFsXx9OMbcMOpIxmYb9kBWhycYFhHXENjv");
        form.append("client_secret", "bUb4kRUuTRgUEoXpXWGHCm0MWsX7YTVDLy0SyQWp8VeFwnElTvcl8naRTaFjOXHjQ6bN9ALxhbFDaXYtYsERdgS6ZFADYO1JYAOO40OIcSJt8RZkzFAWjiKfyJaYxAis");
        form.append("refresh_token", token);

        let renew = await api.post('/o/token/', form);

        login(key, renew.data);

        const DB = new Dexie(`@${key}-televendas`);

        DB.version(10).stores({
            clients: '++id,[company+code+store],name,fantasy_name,cgc,channel,last_order,person_type,address,email,phone,saldup,salpedl,credit_limit,credit_extra_percent,payment_condition,state,able_to_buy,xantibi,xcorrel,xcosmet,xhigien,xmecoes,xmedica',
            products: '++id,active_principle,balance,branch,category,code,company,description,due_date,ean,group,lot,model,price,promotional,provider,recno,subcategory,next_due_date,multiple,taxes',
            fixed_prices: '++id,branch,client,client_group,company,plpag,price,product,recno,seller,store,supervisor',
            policies: '++id,category,client,code,company,description,discount,discount_se,end_date,fixed_price,fixed_price_se,maximum_quantity,maximum_value,minimum_quantity,minium_value,product,provider,recno,seller,start_date,state,store,subcategory,supervisor,type',
            paymentConditions: '++id,company,code,description',
            orders: 'id,sync,pedpalm,client,items,resume',
            profile: '++id,name,email,sellers'
        });

        localStorage.setItem('@sync-time', new Date().getTime());

        let rs = await Promise.all([synchronizeClients(DB), synchronizeProducts(DB), synchronizeFixedPrices(DB), synchronizePolicies(DB), synchronizePaymentConditions(DB), synchronizeProfile(DB, key)]);

        return rs;
    } catch (error) {
        return error;
    }
}

export {
    getDataKey,
    synchronizeClients,
    validateLastSync,
    synchronizeOrders,
    dbExists
};

export default Synchronization;