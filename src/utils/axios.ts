import axios, { AxiosResponse } from "axios";
import { message } from "antd";



const MODE = import.meta.env.MODE
// 设置基础路径
axios.defaults.baseURL = MODE == 'development' ? '' : ''
// 
axios.defaults.withCredentials = true
// 配置请求头
// axios.defaults.headers.post["token"]= `${localStorage.getItem('token') || null}`

axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.interceptors.response.use((res: any) => {
  if (typeof res.result !== 'object') {
    message.error('服务端异常')
    return Promise.reject(res)
  }
  if (res.code !== 200) {
    if (res.data.msg) message.error(res.data.msg)
    if (res.data.code === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(res.data)
  }
  return res.data
})

export default axios


