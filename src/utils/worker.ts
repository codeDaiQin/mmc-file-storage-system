const workercode = () => {
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
        let chunk = file.slice(start, end)
        file_chunks.push(chunk)
      }
    } else {
      file_chunks.push(file)
    }
    return file_chunks
  }

  // 文件上传
  const handSubmit = (price: Blob, index: number, hash: string) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      // 由于是并发，传输到服务端的顺序可能会发生变化，所以我们还需要给每个切片记录顺序
      formData.append('price', price)
      formData.append('hash', hash)
      formData.append('index', `${index}`)

      if (index % 2 === 0) {
        resolve(index)
      } else {
        reject(index)
      }
    })
  }

  // 文件合并
  const merge = (len: number, hash: string) => {
    console.log(len, 'marge')
  }

  self.onmessage = (e) => {
    console.log('收到消息', e)
    // 分片文件
    const totalPrice = sliceFile(e.data.originFileObj)
    const hash = e.data.uid
    console.dir('sliceFile => 对文件进行切片', totalPrice)

    Promise.all(
      totalPrice.map((price, index) => handSubmit(price, index, hash))
    )
      .then(() => {
        // 全部请求完成 关闭自身
        merge(totalPrice.length, hash)
        self.postMessage('请求完成')
        self.close()
      })
      .catch((i) => {})
    // 重试错误的请求
    //   console.log(e)
    // })
  }
}

let code = workercode.toString()

code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'))

const blob = new Blob([code], { type: 'application/javascript' })

const worker_script = URL.createObjectURL(blob)

export default worker_script
