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
  Result,
} from 'antd'
import worker_script from '@/utils/worker'
import size2str from '@/utils/size2str'
import type { MessageType } from '@/utils/worker'
import { merge } from '@/services/file'
import share from '@/utils/copy'
import './index.model.css'
import Steps from '../Steps'

const Send: React.FC = () => {
  const [form] = Form.useForm()
  const [files, setFiles] = useState<File[]>([])
  const [active, setActive] = useState<-1 | 0 | 1 | 2>(-1)
  const [speed, setSpeed] = useState(0)
  const [percent, setPercent] = useState<number>(0) // 进度条
  const [code, setCode] = useState('') // 接收码

  // 上传文件之前的钩子
  const beforeUpload = (_: any, fileList: File[]) => {
    setFiles(fileList)
    setActive(0)
    // 初始化表单
    form.setFieldsValue({
      count: 5,
      time: 24,
    })
    // 返回 false 停止上传 手动触发上传
    return false
  }

  // 上传文件的钩子
  const handleSubmit = () => {
    // 变为loading状态
    setActive(1)
    // 成功上传数量
    let success = 0
    const handleMessage = (e: { data: MessageType }) => {
      const { data, eventType } = e.data

      switch (eventType) {
        case 'init':
          console.log('初始化 分片、计算MD5', data)
          break
        case 'start':
          console.log('开始上传')
          break
        case 'error':
          console.log('失败')
          break
        case 'update':
          console.log('update')
          setSpeed(navigator.connection.downlink!)
          setPercent(data)
          break
        case 'stop':
          console.log('stop')
          break
        case 'finish':
          console.log(success, data, '上传完成')

          if (++success === files.length) {
            console.log('全部上传完成')
            merge({
              ...data,
              ...form.getFieldsValue(['count', 'time']),
            }).then((res) => {
              setCode(res.result)
              setActive(2)
            })
          } else {
            merge({
              ...data,
              ...form.getFieldsValue(['count', 'time']),
            }).then((res) => {
              setCode(res.result)
              setActive(2)
            })
          }
          break
      }
    }

    files.forEach((file, index) => {
      // 为每个文件创建 webwork
      const worker = new Worker('/public/worker.ts', { type: 'module' })
      // 记录所有worker 方便后续取消

      worker.postMessage({
        eventType: 'start',
        data: {
          file,
          index,
        },
      } as MessageType)
      // 监听 worker 回调
      worker.onmessage = handleMessage
    })
  }

  // 处理取消 关闭弹窗
  const handleCancel = () => {
    console.log('康康执行了吗')

    setActive(-1)
    setFiles([])

    // 取消请求
    // workerList.forEach((fn) => fn())
  }

  const steps = [
    {
      title: '已选择的文件',
      onOk: () => handleSubmit(),
      onCancle: handleCancel,
      content: (
        <>
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
          <Form form={form} style={{ marginTop: 20 }}>
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
        </>
      ),
    },
    {
      title: '上传中',
      onCancle: handleCancel,
      content: (
        <>
          当前下载速度{speed} MB/s
          <Progress percent={Math.floor(percent)} status="active" />
        </>
      ),
      footer: null,
    },
    {
      title: '上传完成✅',
      onOk: () => setActive(-1),
      onCancle: handleCancel,
      content: (
        <Result
          style={{ padding: 0 }}
          status="success"
          title="上传完成 你的🐎是"
          extra={[
            <div className="code" onClick={() => share(code)}>
              {code.split('').join(' ')}
            </div>,
          ]}
        />
      ),
    },
  ]

  return (
    <>
      <Upload
        maxCount={10}
        multiple
        showUploadList={false}
        beforeUpload={beforeUpload}
      >
        <Button size="large" type="primary">
          发 送
        </Button>
      </Upload>

      <Steps steps={steps} current={active} />
    </>
  )
}

export default Send
