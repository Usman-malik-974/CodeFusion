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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {

  return (
    <>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <ToastContainer
            autoClose={3000}
            closeOnClick
            pauseOnHover
            draggable
            className="Toastify__toast-container--centered"
          />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/playground' element={<Playground />} />
            <Route path='/admin' element={<AdminDashboard />} >
              <Route index element={<QuestionBank />} />
              <Route path='users' element={<UserManagement />} />
              <Route path='batches' element={<Batches />} />
              <Route path='contests' element={<Contests />} />
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
