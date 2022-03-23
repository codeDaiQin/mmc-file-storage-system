import React, { useRef, useState } from "react"
import { Button } from "antd"
import ReceiveModal from "./receiveModal"
interface RecModal {
  open: Function
} 

const Receive = () => {
  const modal = useRef<RecModal>()
  return (
    <>
      <Button onClick={() => {modal.current?.open()}}>接收</Button>
      <ReceiveModal ref={modal}></ReceiveModal>
    </>
  )
}
export default Receive
