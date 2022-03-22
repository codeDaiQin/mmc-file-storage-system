import axios, { AxiosResponse } from 'axios'
import { message } from 'antd'

const MODE = import.meta.env.MODE
// 设置基础路径
const baseURL = MODE == 'development' ? '' : ''

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
})

// request默认设置
instance.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';

instance.interceptors.response.use((res: any) => {
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

export default instance
