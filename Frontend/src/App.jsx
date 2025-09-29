import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './screen/Home'
import Playground from './screen/Playground'
import Login from './screen/Login'
import AdminDashboard from './screen/AdminDashboard'
import QuestionBank from './components/QuestionBank'
import UserManagement from './components/UserManagement'
import Batches from './components/Batches'
import Contests from './components/Contests'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './screen/Dashboard'
import AdminQuestionView from './screen/AdminQuestionView'
import QuestionView from './screen/QuestionView'
import AssignQuestion from './screen/AssignQuestion'
import ManageBatch from './screen/ManageBatch'
import BatchDashboard from './screen/BatchDashboard'
import PageNotFound from './screen/PageNotFound'
import ContestLogin from './screen/ContestLogin'
import ContestQuestions from './screen/ContestQuestions'
import ResetPassword from './screen/ResetPassword'
import socket from './shared/socket'

function App() {
  useEffect(() => {
    socket.connect(); // Connect manually

    socket.on("connect", () => {
      console.log("Socket connected!", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    return () => {
      socket.disconnect(); // clean up on unmount
    };
  }, []);
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
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/admin' element={<AdminDashboard />} >
              <Route index element={<QuestionBank />} />
              <Route path='users' element={<UserManagement />} />
              <Route path='batches' element={<Batches />} />
              <Route path='contests' element={<Contests />} />
              <Route path='assign' element={<AssignQuestion />} />
            </Route>
            <Route path='/question' element={<QuestionView />} />
            <Route path='/resetpassword/:id' element={<ResetPassword/>}/>
            <Route path='/admin/question' element={<AdminQuestionView />} />
            <Route path='/admin/batch' element={<ManageBatch />} />
            <Route path='/users/batch' element={<BatchDashboard />} />
            <Route path='/test/:id' element={<ContestLogin />} />
            <Route path="/test/questions" element={<ContestQuestions />} />
            <Route path='*' element={<PageNotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
