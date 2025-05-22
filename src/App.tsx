import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginPage from './LoginPage'
import ButtonDemo from './demo/ButtonDemo'
import IconDemo from './demo/IconDemo'
import InputDemo from './demo/InputDemo'
import FormDemo from './demo/FormDemo'
import ComponentDemo from './demo/ComponentDemo'


function App() {
  return (
    <>
      {/* <LoginPage /> */}

        <ButtonDemo/>
        <IconDemo/>
        <InputDemo/>
        <FormDemo/>
        <ComponentDemo/>
    </>
  )
}

export default App
