const workercode = () => {
  const requestList = []

  const delay = (ms: number = 1000) =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, ms)
    })

  // 文件切片
  const sliceFile = (file: File, size: number = 1024 * 1024) => {
    // Blob对象slice方法对二进制文件进行拆分
    console.log(file, 'sliceFile => 对文件进行切片')
    const fileChunkList: Blob[] = [file]
    // let count = 0
    // while (count < file.size) {
    //   fileChunkList.push(file.slice(count, count + size))
    //   count += size
    // }
    // console.log(fileChunkList)

    return fileChunkList
  }

  // 文件上传
  const handSubmit = (price: Blob) => {
    const formData = new FormData()
    formData.append('filename', price)

    return new Promise<void>((resolve, reject) => {
      try {
        delay(2000).then(() => {
          console.log('upload')
          resolve()
        })
      } catch (error) {
        reject()
      }
    })
  }

  // 文件合并
  const merge = () => {}

  self.onmessage = (e) => {
    console.log('收到消息', e)

    // 分片文件
    const totalPrice = sliceFile(e.data)

    Promise.all(totalPrice.map((price) => handSubmit(price)))
      .then(() => {
        // 全部请求完成 关闭自身
        merge()
        self.postMessage('请求完成')
        self.close()
      })
      .catch(() => {
        // 重试错误的请求
      })
  }
}

let code = workercode.toString()
code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'))

const blob = new Blob([code], { type: 'application/javascript' })

const worker_script = URL.createObjectURL(blob)

export default worker_script
