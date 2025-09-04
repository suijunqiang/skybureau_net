// src/config/api.js
export const BASE_URL = 'http://www.suijunqiang.top:1337';

export const API = {
  USER: {
    LOGIN: `${BASE_URL}/api/auth/local`,
    REGISTER: `${BASE_URL}/api/auth/local/register`,
    PROFILE: `${BASE_URL}/api/user/profile`,
    UPDATE_PROFILE: (id) => `${BASE_URL}/api/user/${id}/profile`,
    POSITIONS: `${BASE_URL}/api/positions`,
    MENU: {
      LIST: `${BASE_URL}/api/menus`,
      CREATE: `${BASE_URL}/api/menus`,
      UPDATE: (id) => `${BASE_URL}/api/menus/${id}`,
      DELETE: (id) => `${BASE_URL}/api/menus/${id}`
    }
  },

   PRODUCT: {
    LIST: `${BASE_URL}/api/products`,
    DETAIL: (id) => `${BASE_URL}/api/products/${id}`,
    CREATE: `${BASE_URL}/api/products`,
    UPDATE: (id) => `${BASE_URL}/api/products/${id}`,
    DELETE: (id) => `${BASE_URL}/api/products/${id}`
  },

  ORDER: {
    LIST: `${BASE_URL}/api/orders`,
    DETAIL: (id) => `${BASE_URL}/api/orders/${id}`,
    CREATE: `${BASE_URL}/api/orders`
  },

  UPLOAD: `${BASE_URL}/api/upload`,
  SETTINGS: `${BASE_URL}/api/settings`
};
