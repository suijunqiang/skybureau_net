// src/config/api.js
// export const BASE_URL = 'http://www.suijunqiang.top:1337';
export const BASE_URL = 'http://www.skybureau.net:1337';

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
  // 博客管理接口
  BLOG: {
    B_BLOG:{
      LIST: `${BASE_URL}/api/b-blogs`,
      CREATE: `${BASE_URL}/api/b-blogs`,
      UPDATE: (id) => `${BASE_URL}/api/b-blogs/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-blogs/${id}`
    },
    B_BLOG_TAGS:{
      LIST: `${BASE_URL}/api/b-blog-tags`,
      CREATE: `${BASE_URL}/api/b-blog-tags`,
      UPDATE: (id) => `${BASE_URL}/api/b-blog-tags/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-blog-tags/${id}`
    },
    B_CATEGORIES:{
      LIST: `${BASE_URL}/api/b-categories`,
      CREATE: `${BASE_URL}/api/b-categories`,
      UPDATE: (id) => `${BASE_URL}/api/b-categories/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-categories/${id}`
    },

    B_EXCEPTION_LOGS:{
      LIST: `${BASE_URL}/api/b-exceptions`,
      CREATE: `${BASE_URL}/api/b-exceptions`,
      UPDATE: (id) => `${BASE_URL}/api/b-exceptions/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-exceptions/${id}`
    },
    B_LOGIN_LOGS:{
      LIST: `${BASE_URL}/api/b-login-logs`,
      CREATE: `${BASE_URL}/api/b-login-logs`,
      UPDATE: (id) => `${BASE_URL}/api/b-login-logs/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-login-logs/${id}`
    },
    B_COMMENTS:{
      LIST: `${BASE_URL}/api/b-comments`,
      CREATE: `${BASE_URL}/api/b-comments`,
      UPDATE: (id) => `${BASE_URL}/api/b-comments/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-comments/${id}`
    },
    B_OPERATION_LOGS:{
      LIST: `${BASE_URL}/api/b-operation-logs`,
      CREATE: `${BASE_URL}/api/b-operation-logs`,
      UPDATE: (id) => `${BASE_URL}/api/b-operation-logs/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-operation-logs/${id}`
    },
    B_SCHEDULE_JOB_LOGS:{
      LIST: `${BASE_URL}/api/b-schedule-job-logs`,
      CREATE: `${BASE_URL}/api/b-schedule-job-logs`,
      UPDATE: (id) => `${BASE_URL}/api/b-schedule-job-logs/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-schedule-job-logs/${id}`
    },
    B_SITE_SETTINGS:{
      LIST: `${BASE_URL}/api/b-site-settings`,
      CREATE: `${BASE_URL}/api/b-site-settings`,
      UPDATE: (id) => `${BASE_URL}/api/b-site-settings/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-site-settings/${id}`
    },
    B_TABS:{
      LIST: `${BASE_URL}/api/b-tabs`,
      CREATE: `${BASE_URL}/api/b-tabs`,
      UPDATE: (id) => `${BASE_URL}/api/b-tabs/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-tabs/${id}`
    },
    B_USERS:{
      LIST: `${BASE_URL}/api/b-users`,
      CREATE: `${BASE_URL}/api/b-users`,
      UPDATE: (id) => `${BASE_URL}/api/b-users/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-users/${id}`
    },
    B_VISIT_RECORDS:{
      LIST: `${BASE_URL}/api/b-visit-records`,
      CREATE: `${BASE_URL}/api/b-visit-records`,
      UPDATE: (id) => `${BASE_URL}/api/b-visit-records/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-visit-records/${id}`
    },
    B_CITY_VISITORS:{
      LIST: `${BASE_URL}/api/b-city-visitors`,
      CREATE: `${BASE_URL}/api/b-city-visitors`,
      UPDATE: (id) => `${BASE_URL}/api/b-city-visitors/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-city-visitors/${id}`
    },
    B_SCHEDULE_JOBS:{
      LIST: `${BASE_URL}/api/b-schedule-jobs`,
      CREATE: `${BASE_URL}/api/b-schedule-jobs`,
      UPDATE: (id) => `${BASE_URL}/api/b-schedule-jobs/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-schedule-jobs/${id}`
    },
    B_VISITORS:{
      LIST: `${BASE_URL}/api/b-visitors`,
      CREATE: `${BASE_URL}/api/b-visitors`,
      UPDATE: (id) => `${BASE_URL}/api/b-visitors/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-visitors/${id}`
    },
    B_VISIT_LOGS:{
      LIST: `${BASE_URL}/api/b-visit-logs`,
      CREATE: `${BASE_URL}/api/b-visit-logs`,
      UPDATE: (id) => `${BASE_URL}/api/b-visit-logs/${id}`,
      DELETE: (id) => `${BASE_URL}/api/b-visit-logs/${id}`
    },
  },
  // 设备管理接口
  DEVICES: {
    DEVICES:{
      LIST: `${BASE_URL}/api/iotdevices`,
      CREATE: `${BASE_URL}/api/iotdevices`,
      UPDATE: (id) => `${BASE_URL}/api/iotdevices/${id}`,
      DELETE: (id) => `${BASE_URL}/api/iotdevices/${id}`
    },
    DEVICE_TYPES:{
      LIST: `${BASE_URL}/api/iotdevice-types`,
      CREATE: `${BASE_URL}/api/iotdevice-types`,
      UPDATE: (id) => `${BASE_URL}/api/iotdevice-types/${id}`,
      DELETE: (id) => `${BASE_URL}/api/iotdevice-types/${id}`
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
