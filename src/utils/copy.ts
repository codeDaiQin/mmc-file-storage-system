import copy from 'copy-to-clipboard'
import { message } from 'antd'

const share = (url: string, duration: number = 1) => {
  if (url) {
    copy(`/${url}`)
    message.success('链接已复制!🐛', duration)
  }
}
export default share
