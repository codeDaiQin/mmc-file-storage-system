
import request from '@/utils/request'

// 合并
export async function judgeFileExist(params: {}) {
  return request<boolean>('/api/file/exist', {
    method: 'GET',
    params,
  })
}
