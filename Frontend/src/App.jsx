import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './screen/Home'
import Playground from './screen/Playground'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='playground' element={<Playground/>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
