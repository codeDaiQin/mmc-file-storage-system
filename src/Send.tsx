import React, { useState } from 'react'
import size2str from '@/utils/size2str'
import { Button, Upload, Modal, List, Tag, Space } from 'antd'

const Send: React.FC = () => {
  const [files, setFiles] = useState<File[]>([])
  const [active, setActive] = useState(0)

  const delay = (ms: number = 1000) =>
    new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve()
      }, ms)
    })

  // 文件改变时的回调
  const handleChange = (info: any) => {
    setFiles(info.fileList)
    setActive(1)
    console.log('==== handleChange ====')
  }

  // 上传文件之前的钩子
  const beforeUpload = async (_: any, fileList: File[]) => {
    await delay(1000)
    console.log(fileList)
    console.log('==== beforeUpload ====')

    // 返回 false 停止上传 手动触发上传
    return false
  }

  // 上传文件的钩子
  const handSubmit = () => {
    console.log('==== handSubmit ====')
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
        <Modal
          title="Basic Modal"
          visible={true}
          onCancel={() => setActive(0)}
          onOk={handleOk}
        >
          <List
            dataSource={files}
            renderItem={(item, index) => {
              console.log(item)
              return (
                <List.Item>
                  <Space>
                    {item.name}
                    <Tag color="green">{size2str(item.size)}</Tag>
                  </Space>
                </List.Item>
              )
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default Send
