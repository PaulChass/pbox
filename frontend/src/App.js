import { React, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ShareableLinkPage from './pages/ShareableLinkPage';
import HomePage from './pages/HomePage';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'react-bootstrap/Image';



const App = () => {
  const token = localStorage.getItem('token');
  return (
    <div>
    <div className='flex-container' style={{display:'flex',backgroundColor:'rgb(24,22,59)'}}>
    <a href='/'>
    <Image src={`${process.env.PUBLIC_URL}/images/logo.jpg`}  alt="Site Logo"   style={{maxHeight:'80px',opacity:0.8}}/>
    </a>    
    <div style={{width:'100%'}}></div>
    </div>

    <Router>
      <div>
        {/* Routes for Register and Login */}
        <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/shareable-link/:token" element={<ShareableLinkPage/>} />

        </Routes>

        {/* Additional components */}
   

       
      </div>
    </Router></div>
  );
};

export default App;
