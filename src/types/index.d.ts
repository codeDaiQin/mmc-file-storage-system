declare namespace TSResponse {
  interface ReceiveList {
    id: string | number
    url: string
    size: number
    name: string
  }

  interface ReceiveResponse {
    expreiss: number
    downloadCount: number
    list: Array<ReceiveList>
  }

  interface MergeResponse {
    result: string
  }

  export interface Response {
    code: number
    message: string
    result: ReceiveResponse | boolean
  } 
}
