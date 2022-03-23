import React, { useImperativeHandle, useRef, useState } from "react"
import { Modal } from "antd"
import Input  from "../input"

interface InputRef {
  getValue: () => string | boolean
}

const ReceiveModal = React.forwardRef((props, ref) => {
  const [visible, setVisible] = useState<boolean>(false)
  const [fileState, setFileState] = useState<boolean>(false)
  const inputRef = useRef<InputRef>()

  useImperativeHandle(ref, () => ({
    open: () => {
      setVisible(true)
    }
  }))

  const sendFileNumber = () => {
    console.log(inputRef.current?.getValue())
  }

  const handleClickCancel = () => {
    setVisible(false)
  }

  const renderMessage = () => {
    return fileState  && <div>文件存在</div>
  }

  const getFileState = (state: boolean) => {
    setFileState(state)
  }

  return (
    <>
      <Modal
          title="接收"
          visible={visible}
          onOk={sendFileNumber}
          onCancel={handleClickCancel}
        >
          <Input 
            ref={inputRef} 
            size={6}
            onJudge={getFileState}
          ></Input>
          { renderMessage() }
        </Modal>
    </>
    
  )
})

export default ReceiveModal
