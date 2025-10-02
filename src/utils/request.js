import axios from 'axios'
import { useTokenStore } from '../stores/myToken'
import { BASE_URL } from '../api/api.js'

const request = axios.create({
  baseURL: BASE_URL,
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

// 添加响应拦截器
request.interceptors.response.use(
  response => {
    // 返回完整的响应对象，以便组件可以访问状态码、头部等信息
    return response;
  },
  error => {
    // 处理错误情况
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('API错误:', error.response.status, error.response.data);
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('网络错误:', error.request);
    } else {
      // 设置请求时发生了错误
      console.error('请求配置错误:', error.message);
    }

    // 处理"Unexpected token < in JSON at position 0"错误
    if (error.message && error.message.includes('Unexpected token < in JSON at position 0')) {
      console.error('API返回了HTML而非JSON，这可能是服务器错误或网络问题');
    }

    return Promise.reject(error);
  }
);

export default request;
