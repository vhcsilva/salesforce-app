import { saveDataToIndexedDB } from '../../services/db';

async function createNewOrder() {
  let id = new Date().getTime();

    var newOrder = {
      id: id,
      sync: false,
      pedpalm: '',
      client: null,
      payment_condition: null,
      items: [],
      resume: 0,
      obs: ''
  };

  let created = await saveDataToIndexedDB('orders', newOrder);

  return created ? id : -1;
}

export {
  createNewOrder
};