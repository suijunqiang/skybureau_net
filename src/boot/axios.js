import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { useTokenStore } from '../stores/myToken'
import { BASE_URL } from '../api/api.js'

// 添加请求拦截器到全局axios
export default boot(({ app }) => {
  // 设置全局axios默认配置
  axios.defaults.baseURL = BASE_URL

  // 添加请求拦截器
  axios.interceptors.request.use(
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

  // 为Vue实例添加全局属性
  app.config.globalProperties.$axios = axios
})

// 创建一个带授权的api实例
export const api = axios.create({
  baseURL: BASE_URL
})
