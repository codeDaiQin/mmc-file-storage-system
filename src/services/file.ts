import request from '@/utils/request'

export async function merge(params: {}) {
  return request<TSResponse.MergeResponse>('/merge', {
    method: 'GET',
    params,
  })
}
