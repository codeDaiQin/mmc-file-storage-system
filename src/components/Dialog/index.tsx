import { Modal } from 'antd'
import React from 'react'

interface DialogPropsType {
  onCancel?: Function
  onOk?: Function
  title: string
  [key: string]: any
}

const Dialog: React.FC<DialogPropsType> = (props) => {
  const { children, onCancel = () => {}, onOk = () => {}, title } = props
  return (
    <Modal
      {...props}
      bodyStyle={{ padding: '0 20px' }}
      maskClosable={false}
      title={title}
      visible={true}
      onCancel={() => onCancel()}
      onOk={() => onOk()}
    >
      {children}
    </Modal>
  )
}

export default Dialog
