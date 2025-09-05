import axios from 'axios';
import { useTokenStore } from '../stores/myToken'

const request = axios.create({
  baseURL: "http://www.suijunqiang.top:1337",
});

// 添加请求拦截器
request.interceptors.request.use(
  config => {
    // 获取token
    const tokenStore = useTokenStore()
    const token = tokenStore.token

    // 如果token存在，添加Authorization头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

export default request;
