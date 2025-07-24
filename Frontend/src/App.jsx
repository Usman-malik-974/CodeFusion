import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'
import Home from './screen/Home'
import Playground from './screen/Playground'
import Login from './screen/Login'
import AdminDashboard from './screen/AdminDashborad'
import QuestionBank from './components/QuestionBank'
import UserManagement from './components/UserManagement'
import Batches from './components/Batches'
import Contests from './components/Contests'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/playground' element={<Playground />} />
          <Route path='/admin' element={<AdminDashboard />} >
             <Route index element={<QuestionBank/>}/>
             <Route path='users' element={<UserManagement/>}/>
             <Route path='batches' element={<Batches/>}/>
             <Route path='contests' element={<Contests/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
