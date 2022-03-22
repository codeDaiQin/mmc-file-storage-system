import React, { useState } from 'react'
import {
  Button,
  Upload,
  Progress,
  List,
  Space,
  Tag,
  Form,
  Row,
  Col,
  InputNumber,
} from 'antd'
import worker_script from '@/utils/worker'
import size2str from '@/utils/size2str'
import Dialog from '../Dialog'
import type { MessageType } from '@/utils/worker'
import request from '@/utils/axios'

interface ParamsType {
  count: number
  time: number
}

const Send: React.FC = () => {
  const [form] = Form.useForm()
  const [files, setFiles] = useState<File[]>([])
  const [active, setActive] = useState(0)
  const [percent, setPercent] = useState(0)
  const [code, setCode] = useState('') // 接收码

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

  // 监听 worker 回调
  const handleMessage = (e: { data: MessageType }) => {
    const { data, eventType } = e.data
    // 成功上传的文件数量
    let success = 0

    switch (eventType) {
      case 'init':
        console.log('初始化 分片、计算MD5')
        break
      case 'start':
        console.log('开始上传')
        break
      case 'error':
        console.log('失败')
        break
      case 'update':
        console.log('更新进度条')
        setPercent(data)
        break
      case 'finish':
        console.log(data, '上传完成')
        if (++success === files.length) {
          request.post('/api/test', {
            message: '全部上传完成',
          })
          console.log('全部上传完成')
        }
        break
    }
  }

  // 上传文件的钩子
  const handleSubmit = async () => {
    console.log('==== handSubmit ====')
    files.forEach((file) => {
      // 为每个文件创建 webwork
      const wokrer = new Worker(worker_script)
      wokrer.postMessage(file)
      // 监听进度
      wokrer.onmessage = (e) => handleMessage(e)
    })
  }

  return (
    <>
      <Upload
        maxCount={10}
        multiple
        onChange={handleChange}
        showUploadList={false}
        beforeUpload={beforeUpload}
      >
        <Button size="large" type="primary">
          发 送
        </Button>
      </Upload>
      {active === 1 && (
        <Dialog
          title="已选择的文件"
          onCancel={() => setActive(0)}
          onOk={() => handleSubmit()}
        >
          <List
            dataSource={files}
            renderItem={(item, index) => (
              <List.Item>
                <Space>
                  {item.name}
                  <Tag color="green">{size2str(item.size)}</Tag>
                </Space>
              </List.Item>
            )}
          />
          <Form form={form} onValuesChange={console.log}>
            <Row gutter={[24, 0]} align="middle">
              <Col span={12}>
                <Form.Item label="下载次数" name="count">
                  <InputNumber min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="保留时间" name="time">
                  <InputNumber min={0} addonAfter="小时" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Dialog>
      )}
      {active === 2 && (
        <Dialog title="上传中" footer={false}>
          <Progress percent={percent} status="active" />
        </Dialog>
      )}
      {active === 3 && (
        <Dialog
          title="上传完成"
          onCancel={() => setActive(0)}
          onOk={() => setActive(0)}
        >
          上传完成 你的🐎是： {code}
        </Dialog>
      )}
    </>
  )
}

export default Send
