import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ShareableLinkPage from './pages/ShareableLinkPage';
import HomePage from './pages/HomePage';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'react-bootstrap/Image';
import './App.css';


const App = () => {
  document.title = 'Drive';
  return (
    <div>
    <div className='flex-container'>
    <a href='/'>
    <Image src={`${process.env.PUBLIC_URL}/images/logo.jpg`}  alt="Site Logo"  id='siteLogo'/>
    </a>    
    <div style={{width:'100%'}}></div>
    </div>

    <Router>
      <div>
        <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/shareable-link/:token" element={<ShareableLinkPage/>} />
        </Routes>
      </div>
    </Router></div>
  );
};

export default App;
