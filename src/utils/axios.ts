import axios, { AxiosResponse } from "axios";
import { message } from "antd";
import { TSResponse } from "@/type";

// 设置基础路径
const baseURL = ""

const instance = axios.create({
  baseURL: baseURL
})

instance.defaults.headers.post['Content-Type'] = 'application/json'

instance.interceptors.response.use((res: AxiosResponse<any,TSResponse.Response>) => {
  if (res.status === 500) {
    message.error("服务端错误")
    Promise.reject(res)
  }
  if (res.status !== 200 || res.data.code !== 200) {
    if (res.data.message) message.error(res.data.message)
    if (res.status === 401 || res.data.code === 401) {
      // window.location.href = '/login'
    }
    return Promise.reject(res.data)
  }
  return res.data
})

export default instance
