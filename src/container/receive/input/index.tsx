import React,{ useEffect, useImperativeHandle, useRef, useState } from "react"
import request from "../../../utils/request"
import "./index.css"

interface InputProps {
  size: number
  onJudge: (state: boolean) => void
}

interface Target extends EventTarget {
  dataset: {
    index: string
  }
}

interface Event extends React.KeyboardEvent<HTMLInputElement> {
  target: Target
}

const Input = React.forwardRef<any, InputProps>((props, ref) => {
  const { size, onJudge } = props
  const [values, setValues] = useState<Array<number | string>>(new Array(size).fill(''))
  const inputRefs = useRef<Array<React.RefObject<HTMLInputElement>>>([])

  useImperativeHandle(ref, () => ({
    getValue: () => {
      if (values.join("").length < 6) {
        return false
      }
      return values.join('')
    }
  }))

  useEffect(() => {
    if (values.join("").length < 6) {
      return
    }
    // 待改
    request.get('', {
      params: {
        fileCode: values.join(''),
      },
    })
    .then((res) => {
      // 其他
      if(!res.result) {
        onJudge && onJudge(false)
        return
      }
      onJudge && onJudge(true)
    })
    .catch((e) => {
      console.log(e)
      onJudge && onJudge(false)
    })
  }, [values])

  const changeRes = (res: Array<number | string>, num: number, i: number) => {
    if (i > size -1) return
    if (!res[i]) {
      res[i] = num
      if (i + 1 > size -1) {
        return
      }
      inputRefs.current[i + 1].current!.focus()
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
    console.log(values[changeIndex])
    const res = values.slice()
    res[changeIndex] = ""
    setValues(res)
  }

  const keyCode = {
    "ArrowLeft": (e: Event) => {
      const wz =Number(e.target.dataset.index)
      if (wz === 0) return
      inputRefs.current[wz - 1].current?.focus()
      setTimeout(() => {
        inputRefs.current[wz - 1].current?.setSelectionRange(-1, -1)
      })
    },
    "ArrowRight": (e: Event) => {
      const wz =Number(e.target.dataset.index)
      if (wz === size - 1) return
      inputRefs.current[wz + 1].current?.focus()
      setTimeout(() => {
        inputRefs.current[wz - 1].current?.setSelectionRange(-1, -1)
      })
    },
  }
 
  const handlePass = (e: Event) => {
    if (!document.hasFocus) return
    if (!Object.keys(keyCode).includes(e.code)) return
    keyCode[e.code](e)
  }

  return (
    <div className="input" onKeyDown={handlePass}>
      {
        values.length > 0 && values?.map((v, i)=>{
          inputRefs.current[i] = React.createRef()
          return <input
            key={i}
            value={v}
            data-index={i}
            className="input-item"
            ref={inputRefs.current[i]}
            onKeyDown={deleteContent} 
            onChange={handleChange} 
          ></input>
        })
      }
    </div>
  )
})

export default Input
