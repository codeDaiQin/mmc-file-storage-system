import React from 'react'
import Send from '@/components/Send'
import logo from '../public/logo.svg'
import './App.css'

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>mmc-file-storage-system</p>
        <p>By: 毛毛虫&可乐加冰</p>
        <Send />
      </header>
    </div>
  )
}

export default App
