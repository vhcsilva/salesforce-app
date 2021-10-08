import axios from "axios";
import { getToken, login, logout } from "./auth";

const api = axios.create({
  baseURL: "********"
});

api.interceptors.request.use(async config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchFilteredClients = async (filter) => {
  let clients = [];

  if (filter !== '') {
    try {
      let response = await api.get(`/client/filter/${filter}`);

      clients = response.data.clients;

    } catch (error) {
      console.log(error);
    }
  }

  return clients
}

export const fetchFilteredOrders = async (filter) => {
  let orders = [];

  if (filter !== '') {
    try {
      let response = await api.get(`/order/filter/${filter}`);

      orders = response.data.orders;

    } catch (error) {
      console.log(error);
    }
  }

  return orders
}

export const fetchFilteredTitles = async (filter) => {
  let titles = [];

  if (filter !== '') {
    try {
      let response = await api.get(`/api/v1/titles/`, {
        params: {
          client: filter
        }
      });

      titles = response.data;

    } catch (error) {
      console.log(error);
    }
  }

  return titles
}

export const fetchProducts = async (page) => {
  let products = [];

  try {
    products = api.get(`/products?page=${page}`);
  } catch (error) {
    console.log(error);
  }

  return products;
}

export const fetchTeam = async (filter) => {
  let team = [];

  if (filter !== '') {
    try {
      let response = await api.get(`/client/team/${filter}`);

      team = response.data;

    } catch (error) {
      console.log(error);
    }
  }

  return team
}

export const logoutToken = async () => {
  try {
    logout();

    api.post(`/logout`);
  } catch (error) {
    console.log(error);
  }
}

export const refreshToken = async () => {
  try {
    let response = await api.post(`/refresh`);

    login(response.data);
  } catch (error) {
    console.log(error);
  }
}

export const syncOrder = async (header, items) => {
  return api.post('/api/v1/order/', {
    header,
    items
  });
}

export default api;