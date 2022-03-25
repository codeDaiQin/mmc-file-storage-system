import request from '@/utils/request'

// 合并
export async function merge(params: {}) {
  return request<TSResponse.MergeResponse>('/merge', {
    method: 'GET',
    params,
  })
}

// 上传分片
export async function upload(data: FormData) {
  return request<TSResponse.MergeResponse>('/upload', {
    method: 'POST',
    data,
  })
}
