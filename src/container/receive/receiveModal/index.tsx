import React, { useEffect, useImperativeHandle, useRef, useState } from "react"
import { Modal } from "antd"
import Input  from "../input"

interface InputRef {
  getValue: () => string | boolean
}

const ReceiveModal = React.forwardRef((props, ref) => {
  const [visible, setVisible] = useState<boolean>(false)
  const inputRef = useRef<InputRef>()

  useImperativeHandle(ref, () => ({
    close: () => {
      setVisible(true)
    }
  }))

  const sendFileNumber = () => {
    console.log(123)
    console.log(inputRef.current?.getValue())
  }

  const handleClickCancel = () => {
    setVisible(false)
  }


  return (
    <>
      <Modal
          title="接收"
          visible={visible}
          onOk={sendFileNumber}
          onCancel={handleClickCancel}
        >
          <Input ref={inputRef} size={6}></Input>
        </Modal>
    </>
    
  )
})

export default ReceiveModal