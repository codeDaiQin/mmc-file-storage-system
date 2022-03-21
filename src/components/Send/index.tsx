import React, { useState } from 'react'
import {
  Button,
  Upload,
  Modal,
  Progress,
  List,
  Space,
  Tag,
  Form,
  Row,
  Col,
  InputNumber,
  Divider,
} from 'antd'
import worker_script from '@/utils/worker'
import size2str from '@/utils/size2str'

const Send: React.FC = () => {
  const [form] = Form.useForm()
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
    setActive(3)
  }

  return (
    <div>
      <Upload
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
        <Modal
          bodyStyle={{ padding: '0 20px' }}
          maskClosable={false}
          title="已选择的文件"
          visible={true}
          onCancel={() => setActive(0)}
          onOk={() => handSubmit()}
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
          <Form form={form}>
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
        </Modal>
      )}
      {active === 2 && (
        <Modal
          maskClosable={false}
          title="上传中"
          visible={true}
          footer={false}
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
