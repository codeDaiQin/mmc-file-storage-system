export interface MessageType {
  eventType: 'start' | 'error' | 'update' | 'init' | 'finish' | 'stop'
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

  // 动态切片计算分片大小
  const dynamicSilce = async (file: File) => {
    const { size } = file
    let chunk_size = 1024 * 1024 * 2 // 初始切片大小2M
    let uploadSize = 0 // 已经上传的大小
    let lastTime = 1 // 上次上传的时间
    let lastSize = chunk_size // 上次上传的大小
    while (uploadSize < size) {
      let retry = 0 // 重试次数
      const formData = new FormData()
      // 截取切片
      const price = file.slice(uploadSize, uploadSize + chunk_size)
      // 由于是并发，传输到服务端的顺序可能会发生变化，所以我们还需要给每个切片记录顺序
      // formData.append('hash', hash)
      // formData.append('index', `${index}`)
      formData.append('price', price)
      // 分析上传时间和大小 动态计算分片大小

      uploadSize += chunk_size // 计算已上传的大小

      const upload = () =>
        new Promise((resolve, reject) => {
          const startTime = new Date().getTime() // 开始上传时间
          // 等待上传 ... 重试等操作
          request({ url: '/upload', data: formData, method: 'POST' })
            .then(() => {
              const endTime = new Date().getTime() // 结束上传时间
              const time = Math.floor(endTime - startTime) //  本次上传时间
              // let rate: number = time / chunk_size / (lastTime / lastSize) // 计算倍率
              lastTime = time //  下次计算
              // 新的切片大小等比变化
              // chunk_size = chunk_size * rate
              console.log(`大小${chunk_size / 1024 / 1024}M - 时间${time}`)
              // 测试错误重传
              // if (retry < 3) throw new Error()
            })
            .catch(() => {
              if (++retry > 3) {
                console.log('大哥 烂了 别传了')
                reject()
                return
              } else {
                console.log('我再试试')
                upload()
              }
            })
        })

      upload()
    }
  }

  // 文件上传
  const handSubmit = (
    totalPrice: Blob[],
    hash: string,
    fileName: string,
    index: number // worker Id
  ) => {
    self.postMessage({
      eventType: 'start',
      data: {},
    } as MessageType)

    const upload = (price: Blob, index: number) => {
      return new Promise((resolve, reject) => {
        let retry = 0
        const formData = new FormData()
        // 由于是并发，传输到服务端的顺序可能会发生变化，所以我们还需要给每个切片记录顺序
        formData.append('hash', hash)
        formData.append('index', `${index}`)
        formData.append('price', price)
        request({
          url: '/upload',
          method: 'POST',
          data: formData,
        })
          .then(() => {
            resolve(index)
            // 处理上传进度
            self.postMessage({
              eventType: 'update',
              data: (index / totalPrice.length) * 100,
            } as MessageType)
          })
          .catch((error) => {
            // 错误重传 3次内
            if (++retry >= 3) {
              reject()
            } else {
              upload(price, index)
            }
          })
      })
    }

    // upload()

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
              url: '/upload',
              method: 'POST',
              data: formData,
            })
              .then(() => {
                resolve(index)
                // 处理上传进度
                self.postMessage({
                  eventType: 'update',
                  data: (index / totalPrice.length) * 100,
                } as MessageType)
              })
              .catch((error) => {
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
                      .then(() => {
                        clearInterval(timer)
                      }) // 请求成功清除定时器
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
            index,
          },
        } as MessageType)
      })
      .catch((error) => {
        self.postMessage({
          eventType: 'error',
        } as MessageType)
      })
      .finally(() => self.close()) // 上传完成关闭线程
  }

  // 计算MD5
  const getFileMD5 = (file: File, initCallback: Function) => {}

  self.onmessage = (e) => {
    const { data, eventType } = e.data

    switch (eventType) {
      case 'start':
        console.log('开始上传')
        const { file, index } = data
        // 分片文件
        const fileName = file.name

        const totalPrice = sliceFile(file.originFileObj)
        dynamicSilce(file.originFileObj)
        // handSubmit(totalPrice, new Date().getTime().toString(), fileName, index)
        break
      case 'stop':
        console.log('停止上传')
        break
    }
  }
}

let code = workercode.toString()

code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'))

const blob = new Blob([code], { type: 'application/javascript' })

const worker_script = URL.createObjectURL(blob)

export default worker_script
