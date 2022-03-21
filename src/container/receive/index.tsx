import React, { useState } from "react"
import { Button } from "antd"

const Receive = () => {
  const [showModel, setShowModel] = useState(false)
  return (
    <>
      <Button onClick={() => {setShowModel(true)}}>接收</Button>
    </>
  )
}
export default Receive