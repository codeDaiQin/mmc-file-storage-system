import { upload, merge } from '@/services/file'
import SparkMD5 from 'spark-md5'

export interface MessageType {
  eventType: 'start' | 'error' | 'update' | 'init' | 'finish' | 'stop'
  data: any
}

// 动态切片
const dynamicSilce = async (
  file: File,
  priceCB: (price: Blob, index: number) => Promise<any>, // 每个切片的回调
  successCB: (length: number) => void, // 上传完成的回调
  errorCB: () => void // 失败的回调
) => {
  const { size } = file // 文件大小
  let chunk_size = 1024 * 1024 * 2 // 初始切片大小2M
  let uploadSize = 0 // 已经上传的大小
  let uploadIndex = 0 // 已经上传的切片数量
  while (uploadSize < size) {
    const price = file.slice(uploadSize, uploadSize + chunk_size) // 截取切片
    uploadSize += price.size // 计算已上传的大小
    try {
      const startTime = new Date().getTime()
      await priceCB(price, ++uploadIndex)
      const endTime = new Date().getTime()
      const time = (endTime - startTime) / 1000
      console.log(`size: ${price.size} time: ${time}`)
      chunk_size = chunk_size * time > 30 ? 0.5 : 2 // 计算下次切片的大小
    } catch (error) {
      errorCB()
      break
    }
  }
  successCB(uploadIndex)
}

// 上传
const handleUpload = (price: Blob, index: number): Promise<any> => {
  return new Promise<void>((resolve, reject) => {
    let retry = 0 // 重试次数
    const formData = new FormData()
    formData.append('price', price)
    formData.append('index', index.toString())
    const retryFn = () => {
      upload(formData)
        .then(() => resolve())
        .catch(() => (++retry >= 3 ? reject() : retryFn())) // 允许重试3次
    }
    retryFn()
  })
}

// 上传完成的回调
const handleSuccess = (length: number, hash: string, fileName: string) => {
  
  self.postMessage({
    eventType: 'finish',
    data: {
      hash,
      length,
      fileName,
    },
  })
}

// 上传错误的回调
const handleError = (index: number) => {
  self.postMessage({ eventType: 'error', data: index })
}

// 生成MD5
const createHash = (file: File) => new Promise<string>((resolve) => {
  const fileReader = new FileReader()
  const spark = new SparkMD5.ArrayBuffer();
  fileReader.readAsArrayBuffer(file)
  fileReader.onload = (e: any) => {
    spark.append(e.target.result);
    console.log('计算hash')
    resolve(spark.end());
  };
})

self.onmessage = async (e: { data: MessageType }) => {
  const { eventType, data } = e.data
  switch (eventType) {
    case 'start':
      const { file, index } = data
      const hash = await createHash(file)
    

      if (!'校验MD5') {
      } else {
        dynamicSilce(
          file,
          handleUpload,
          (length: number) => handleSuccess(length, hash, file.name),
          () => handleError(index)
        )
      }

      break
    case 'stop':
      break
  }
}
