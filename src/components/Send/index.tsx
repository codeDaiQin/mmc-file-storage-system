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
  Modal,
  Result,
  Card,
} from 'antd'
import worker_script from '@/utils/worker'
import size2str from '@/utils/size2str'
import type { MessageType } from '@/utils/worker'
import { merge } from '@/services/file'
import share from '@/utils/copy'
import './index.model.css'

const Send: React.FC = () => {
  const [form] = Form.useForm()
  const [files, setFiles] = useState<File[]>([])
  const [active, setActive] = useState<0 | 1 | 2 | 3>(0)
  const [speed, setSpeed] = useState(0)
  const [percent, setPercent] = useState<number>(0) // 进度条
  const [code, setCode] = useState('') // 接收码

  // 文件改变时的回调
  const handleChange = (info: any) => {
    setFiles(info.fileList)
    setActive(1)
    // 初始化表单
    form.setFieldsValue({
      count: 5,
      time: 24,
    })
  }

  // 上传文件之前的钩子
  const beforeUpload = async (_: any, fileList: File[]) => {
    console.log(fileList)
    console.log('==== beforeUpload ====')
    // 返回 false 停止上传 手动触发上传
    return false
  }

  // 上传文件的钩子
  const handleSubmit = () => {
    // 变为loading状态
    setActive(2)
    console.log('setactive', active)

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
          setSpeed(navigator.connection.downlink!)
          setPercent(data)
          break
        case 'finish':
          console.log(success, data, '上传完成')
          if (++success === files.length) {
            merge({
              ...data,
              ...form.getFieldsValue(['count', 'time']),
            }).then((res) => {
              setCode(res.result)
              setActive(3)
            })
          }
          break
      }
    }

    files.forEach((file) => {
      // 为每个文件创建 webwork
      const wokrer = new Worker(worker_script)
      wokrer.postMessage(file)
      // 监听 worker 回调
      wokrer.onmessage = handleMessage
    })
  }

  // 处理取消 关闭弹窗
  const handleCancel = () => {
    console.log('康康执行了吗')

    setActive(0)
    setFiles([])

    // 取消请求
    // 🤔
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

      {/* 选择文件 */}
      {active === 1 && (
        <Modal
          title="已选择的文件"
          bodyStyle={{ padding: 0 }}
          maskClosable={false}
          visible={active === 1}
          onCancel={handleCancel}
          onOk={() => handleSubmit()}
        >
          <Card>
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
          </Card>
        </Modal>
      )}

      {/* 进度条 */}
      {active === 2 && (
        <Modal
          title="上传中"
          footer={false}
          visible={true}
          maskClosable={false}
          onCancel={handleCancel}
        >
          当前下载速度{speed} MB/s
          <Progress percent={Math.floor(percent)} status="active" />
        </Modal>
      )}

      {/* 上传完成 */}
      {active === 3 && (
        <Modal
          title="上传完成"
          visible={true}
          maskClosable={false}
          onCancel={handleCancel}
          onOk={() => setActive(0)}
        >
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
        </Modal>
      )}
    </>
  )
}

export default Send
