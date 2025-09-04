import axios from 'axios';
import request from "src/utils/request";

//Login api
export const login = (userInfo) => {
  // 使用独立的axios实例而不是全局配置的request实例
  // 确保登录请求完全不受请求拦截器影响
  const loginAxios = axios.create();

  return loginAxios({
    url: "http://www.suijunqiang.top:1337/api/auth/local",
    method: "post",
    data: userInfo,
    // 确保不包含Authorization头
    headers: {
      Authorization: ''
    },
    // 避免与baseURL冲突
    baseURL: ''
  });
};

//Register api
export const register = (userInfo) => {
  return request({
    url: "http://www.suijunqiang.top:1337/api/auth/local/register",
    method: "post",
    data: userInfo,
    // 避免与baseURL冲突
    baseURL: ''
  });
};
