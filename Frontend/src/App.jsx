import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './screen/Home'
import Playground from './screen/Playground'
import Login from './screen/Login'
import AdminDashboard from './screen/AdminDashborad'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/playground' element={<Playground/>} />
          <Route path='/admin' element={<AdminDashboard/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
