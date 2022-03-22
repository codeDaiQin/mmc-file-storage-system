import request from '@/utils/request'

export interface MessageType {
  eventType: 'start' | 'reUpload' | 'update' | 'init' | 'finish'
  data: any
}

interface PriceListType {
  price: Blob // 分片
  retry: number // 重试次数
}

const workercode = () => {
  // 文件切片
  const sliceFile = (file: File) => {
    const { size } = file
    const chunk_size = 1024 * 1024 * 2
    const total_chunks = Math.ceil(size / chunk_size)
    const file_chunks: PriceListType[] = []

    if (size > chunk_size) {
      for (let i = 0; i < total_chunks; i++) {
        let start = i * chunk_size
        let end = (i + 1) * chunk_size
        let price = file.slice(start, end)
        file_chunks.push({ price, retry: 0 })
      }
    } else {
      file_chunks.push({ price: file, retry: 0 })
    }
    return file_chunks
  }

  // 文件上传
  const handSubmit = (totalPrice: PriceListType[], hash: string) => {
    const formData = new FormData()
    // 由于是并发，传输到服务端的顺序可能会发生变化，所以我们还需要给每个切片记录顺序
    formData.append('hash', hash)
    self.postMessage({
      eventType: 'start',
      data: {},
    } as MessageType)

    totalPrice.forEach(({ price, retry }, index) => {
      request
        .post('/api/test', price)
        .then(() => {
          console.log('计算进度')
        })
        .catch(() => {
          // 错误重传 3次内
          const timer = setInterval(() => {
            if (retry > 3) {
              console.log('连接失败')
              // 清除定时器
              clearInterval(timer)
            } else {
              // 重试次数在规定内
              console.log('重试次数', retry)
              request
                .post('/api/test', price)
                .then(() => clearInterval(timer)) // 请求成功清除定时器
                .catch(() => totalPrice[index].retry++) // 重试次数+1
            }
          }, 1000)
        })
    })
  }

  // 文件合并
  const merge = (len: number, hash: string) => {
    console.log(len, 'marge')
  }

  // 计算MD5
  const getFileMD5 = (file: File, initCallback: Function) => {}

  self.onmessage = (e) => {
    console.log('收到消息', e)
    // 分片文件
    const totalPrice = sliceFile(e.data.originFileObj)
    handSubmit(totalPrice, '123')
  }
}

let code = workercode.toString()

code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'))

const blob = new Blob([code], { type: 'application/javascript' })

const worker_script = URL.createObjectURL(blob)

export default worker_script
