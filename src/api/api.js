// src/config/api.js
export const BASE_URL = 'http://www.suijunqiang.top:1337';

export const API = {
  USER: {
    LOGIN: `${BASE_URL}/api/auth/local`,
    REGISTER: `${BASE_URL}/api/auth/local/register`,
    PROFILE: `${BASE_URL}/api/user/profile`,
    UPDATE_PROFILE: (id) => `${BASE_URL}/api/user/${id}/profile`,
    MENU: {
      LIST: `${BASE_URL}/api/menus`,
      CREATE: `${BASE_URL}/api/menus`,
      UPDATE: (id) => `${BASE_URL}/api/menus/${id}`,
      DELETE: (id) => `${BASE_URL}/api/menus/${id}`
    },

    // 分支管理接口
    BRANCH: {
      LIST: `${BASE_URL}/api/branches`,
      CREATE: `${BASE_URL}/api/branches`,
      UPDATE: (id) => `${BASE_URL}/api/branches/${id}`,
      DELETE: (id) => `${BASE_URL}/api/branches/${id}`
    },
    // 职位管理接口
    POSITION: {
      LIST: `${BASE_URL}/api/positions`,
      CREATE: `${BASE_URL}/api/positions`,
      UPDATE: (id) => `${BASE_URL}/api/positions/${id}`,
      DELETE: (id) => `${BASE_URL}/api/positions/${id}`
    },
    // 用户管理接口
    USERS: {
      LIST: `${BASE_URL}/api/users`,
      CREATE: `${BASE_URL}/api/users`,
      UPDATE: (id) => `${BASE_URL}/api/users/${id}`,
      DELETE: (id) => `${BASE_URL}/api/users/${id}`
    },
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
