// src/config/api.js
const BASE_URL = 'http://www.suijunqiang.top:1337/api';

export const API = {
  USER: {
    LOGIN: `${BASE_URL}/auth/local`,
    REGISTER: `${BASE_URL}/auth/local/register`,
    PROFILE: `${BASE_URL}/user/profile`,
    UPDATE_PROFILE: (id) => `${BASE_URL}/user/${id}/profile`
  },

   PRODUCT: {
    LIST: `${BASE_URL}/products`,
    DETAIL: (id) => `${BASE_URL}/products/${id}`,
    CREATE: `${BASE_URL}/products`,
    UPDATE: (id) => `${BASE_URL}/products/${id}`,
    DELETE: (id) => `${BASE_URL}/products/${id}`
  },

  ORDER: {
    LIST: `${BASE_URL}/orders`,
    DETAIL: (id) => `${BASE_URL}/orders/${id}`,
    CREATE: `${BASE_URL}/orders`
  },

  UPLOAD: `${BASE_URL}/upload`,
  SETTINGS: `${BASE_URL}/settings`
};
