import React, { useState } from 'react'
import { Button, Upload, Modal, Progress } from 'antd'
import worker_script from '@/utils/worker'
import Step1 from './Step1'

const Send: React.FC = () => {
  const [files, setFiles] = useState<File[]>([])
  const [active, setActive] = useState(0)
  const [percent, setPercent] = useState(0)

  // 文件改变时的回调
  const handleChange = (info: any) => {
    setFiles(info.fileList)
    setActive(1)
    console.log('==== handleChange ====')
  }

  // 上传文件之前的钩子
  const beforeUpload = async (_: any, fileList: File[]) => {
    console.log(fileList)
    console.log('==== beforeUpload ====')

    // 返回 false 停止上传 手动触发上传
    return false
  }

  // 上传文件的钩子
  const handSubmit = async () => {
    console.log('==== handSubmit ====')
    let success = 0
    files.forEach((file) => {
      // 为每个文件创建 webwork
      const wokrer = new Worker(worker_script)
      wokrer.postMessage(file)

      // 监听进度
      wokrer.onmessage = (e) => {
        console.log(e.data)
        if (++success === files.length) {
          console.log('全部上传完成')
          setActive(3)
        }
        setPercent(files.length / success)
      }
    })
    setActive(2)
  }

  //
  const handleOk = () => {}

  return (
    <div>
      <Upload
        multiple
        onChange={handleChange}
        showUploadList={false}
        beforeUpload={beforeUpload}
      >
        <Button>发送</Button>
      </Upload>
      {active === 1 && (
        <Step1
          onCancel={() => setActive(0)}
          onOk={() => handSubmit()}
          files={files}
        />
      )}
      {active === 2 && (
        <Modal
          maskClosable={false}
          title="上传中"
          visible={true}
          onCancel={() => setActive(0)}
          onOk={handleOk}
        >
          <Progress percent={percent} status="active" />
        </Modal>
      )}
      {active === 3 && (
        <Modal
          maskClosable={false}
          title="上传完成"
          visible={true}
          onCancel={() => setActive(0)}
          onOk={() => setActive(0)}
        >
          上传完成 你的🐎是： 123458
        </Modal>
      )}
    </div>
  )
}

export default Send
