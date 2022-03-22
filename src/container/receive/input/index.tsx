import { type } from "os"
import React,{ useEffect, useImperativeHandle, useState } from "react"
import "./index.css"
interface InputProps {
  size: number
}

interface Target extends EventTarget {
  dataset: {
    index: string
  }
}

interface Event extends  React.KeyboardEvent<HTMLInputElement> {
  target: Target
}

const Input = React.forwardRef<any, InputProps>((props, ref) => {
  const { size } = props
  const [values, setValues] = useState<Array<number | string>>([])

  useEffect(() => {
    setValues(new Array(size).fill(''))
  }, [])

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (values.join("").length < 6) {
        return false
      }
      return values.join('')
    }
  }))

  const changeRes = (res: Array<number | string>, num: number, i: number) => {
    if (i > size -1) {
      return
    }
    if (!res[i]) {
      res[i] = num
      return
    }
    if (res[i]) {
      changeRes(res, num, i + 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const changeIndex =Number(e.target.getAttribute('data-index'))
    const res = values.slice()
    if (isNaN(Number(e.target.value))) {
      return
    }
    changeRes(res, Number(e.target.value) % 10, changeIndex)
    setValues(res)
  }

  const deleteContent = (e: Event) => {
    if (e.code !== "Backspace") {
      return
    }
    const changeIndex =Number(e.target.dataset["index"])
    const res = values.slice()
    res[changeIndex] = ""
    setValues(res)
  }

  return (
    <div className="input" >
      {
        values.length > 0 && values?.map((v, i)=>{
          return <input onKeyDown={deleteContent} key={i} onChange={handleChange} className="input-item" value={v} data-index={i}></input>
        })
      }
    </div>
  )
})

export default Input