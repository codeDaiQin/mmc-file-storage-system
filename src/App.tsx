import React from 'react'
import Receive from './container/receive'
import Send from '@/components/Send'
import logo from '../public/logo.svg'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <a href="https://github.com/codeDaiQin/mmc-file-storage-system">
          react go 分布式文件存储服务
        </a>
        <p>By: 毛毛虫&可乐加冰</p>
        <Send />
        <Receive></Receive>
      </header>
    </div>
  )
}

export default App
