import request from '@/utils/request'

// 合并
export async function merge(params: {}) {
  return request<TSResponse.MergeResponse>('/merge', {
    method: 'GET',
    params,
  })
}
