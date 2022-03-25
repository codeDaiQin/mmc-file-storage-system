import React from 'react'
import { Card, Modal } from 'antd'

interface StepsPropsType {
  steps: {
    title: string
    content: React.ReactNode
    onOk?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
    onCancle: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void
  }[]
  current: number
  [key: string]: any
}

const Steps: React.FC<StepsPropsType> = (props) => {
  const { steps, current } = props

  return (
    <div>
      {current > -1 && (
        <Modal
          visible={current > -1}
          maskClosable
          onOk={steps[current].onOk && steps[current].onOk}
          onCancel={steps[current].onCancle}
          title={steps[current].title}
          bodyStyle={{ padding: 0 }}
          // forceRender
          getContainer={false}
          {...props}
        >
          <Card>{steps[current].content}</Card>
        </Modal>
      )}
    </div>
  )
}

export default React.memo(Steps)
