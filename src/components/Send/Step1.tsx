import React from 'react'
import { Modal, List, Space, Tag, Form, Row, Col, InputNumber } from 'antd'
import size2str from '@/utils/size2str'

interface Step1PropsType {
  onCancel: Function
  onOk: Function
  files: File[]
}

const Step1: React.FC<Step1PropsType> = ({ onCancel, onOk, files }) => {
  const [form] = Form.useForm()
  return (
    <Modal
      maskClosable={false}
      title="已选择的文件"
      visible={true}
      onCancel={() => onCancel()}
      onOk={() => onOk()}
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
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="下载次数" name="count">
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="保留时间" name="time">
              <InputNumber min={0} addonAfter='小时' />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default Step1
