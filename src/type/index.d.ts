 export namespace TSResponse {
  interface ReceiveList {
    id: string | number,
    url: string,
    size: number,
     name: string
  }
  
  interface SendResponse {
    
  }
  
  interface ReceiveResponse {
    expreiss: number
    downloadCount: number
    list: Array<ReceiveList>
  }
  
  export interface Response {
    code: number
    message: string
    result: ReceiveResponse | SendResponse
  } 
}