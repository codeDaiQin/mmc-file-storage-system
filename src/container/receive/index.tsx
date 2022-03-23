import React, { useRef, useState } from "react"
import { Button } from "antd"
import ReceiveModal from "./receiveModal"
interface RecModal {
  close: Function
} 

const Receive = () => {
  const modal = useRef<RecModal>()
  return (
    <>
      <Button onClick={() => {modal.current?.close()}}>接收</Button>
      <ReceiveModal ref={modal}></ReceiveModal>
    </>
  )
}
export default Receive