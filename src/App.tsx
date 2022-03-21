import React from 'react'
import Receive from './container/receive'
import Send from './Send'

const App: React.FC = () => {
  return (
    <div>
      <Send />
      <Receive></Receive>
    </div>
  )
}

export default App
