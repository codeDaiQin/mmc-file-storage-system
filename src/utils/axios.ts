import axios from "axios";
import { message } from "antd";

const MODE = import.meta.env.MODE
// 设置基础路径
axios.defaults.baseURL = MODE == 'development' ? '' : 'http://staineds.com:7001'
// 
axios.defaults.withCredentials = true
// 配置请求头
axios.defaults.headers['Accept-Encoding'] = 'gzip'
axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers['Authorization'] = `${localStorage.getItem('token') || null}`
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.interceptors.response.use(res => {
  if (typeof res.data !== 'object') {
    message.error('服务端异常')
    return Promise.reject(res)
  }
  if (res.data.code !== 200) {
    if (res.data.msg) message.error(res.data.msg)
    if (res.data.code === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(res.data)
  }
  return res.data
})

export default axios


