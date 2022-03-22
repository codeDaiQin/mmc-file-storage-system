export interface MessageType {
  eventType: 'start' | 'error' | 'update' | 'init' | 'finish'
  data: any
}

interface RequestConfig {
  url: string
  method: 'GET' | 'POST'
  data?: any
}

const workercode = () => {
  const request = ({ method, url, data }: RequestConfig) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, `http://localhost:4396${url}`, true)
      xhr.onerror = () => {
        console.log('onerror')
      }
      xhr.ontimeout = () => {
        console.log('ontimeout')
      }
      // xhr.withCredentials = true
      xhr.timeout = 30 * 1000
      // xhr.setRequestHeader('Content-Type', 'multipart/form-data')
      xhr.send(method === 'GET' ? null : data)
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response)
          } else {
            reject(xhr.response)
          }
        }
      }
    })
  }

  // 文件切片
  const sliceFile = (file: File) => {
    const { size } = file
    const chunk_size = 1024 * 1024 * 2
    const total_chunks = Math.ceil(size / chunk_size)
    const file_chunks: Blob[] = []

    if (size > chunk_size) {
      for (let i = 0; i < total_chunks; i++) {
        let start = i * chunk_size
        let end = (i + 1) * chunk_size
        let price = file.slice(start, end)
        file_chunks.push(price)
      }
    } else {
      file_chunks.push(file)
    }
    return file_chunks
  }

  // 文件上传
  const handSubmit = (totalPrice: Blob[], hash: string, fileName: string) => {
    self.postMessage({
      eventType: 'start',
      data: {},
    } as MessageType)
    Promise.all(
      totalPrice.map(
        (price, index) =>
          new Promise<number>((resolve, reject) => {
            let retry = 0
            const formData = new FormData()
            // 由于是并发，传输到服务端的顺序可能会发生变化，所以我们还需要给每个切片记录顺序
            formData.append('hash', hash)
            formData.append('index', `${index}`)
            formData.append('price', price)
            request({
              method: 'POST',
              url: '/upload',
              data: formData,
            })
              .then(() => {
                resolve(index)
                // 处理上传进度
                console.log('计算进度')
              })
              .catch(() => {
                // 错误重传 3次内
                const timer = setInterval(() => {
                  if (retry >= 3) {
                    reject(index)
                    // 清除定时器
                    clearInterval(timer)
                  } else {
                    // 重试次数在规定内
                    request({
                      method: 'POST',
                      url: '/upload',
                      data: formData,
                    })
                      .then(() => clearInterval(timer)) // 请求成功清除定时器
                      .catch(() => ++retry) // 重试次数+1
                  }
                }, 1000)
              })
          })
      )
    )
      .then(() => {
        self.postMessage({
          eventType: 'finish',
          data: {
            length: totalPrice.length,
            hash,
            fileName,
          },
        } as MessageType)
      })
      .catch((error) => {
        self.postMessage({
          eventType: 'error',
        } as MessageType)
      })
  }

  // 计算MD5
  const getFileMD5 = (file: File, initCallback: Function) => {}

  self.onmessage = (e) => {
    console.log('收到消息', e)
    // 分片文件
    const fileName = e.data.name

    const totalPrice = sliceFile(e.data.originFileObj)
    handSubmit(totalPrice, '123', fileName)
  }
}

let code = workercode.toString()

code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'))

const blob = new Blob([code], { type: 'application/javascript' })

const worker_script = URL.createObjectURL(blob)

export default worker_script
