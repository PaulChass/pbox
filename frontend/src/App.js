import { React, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import ShareableLinkPage from './pages/ShareableLinkPage';
import HomePage from './pages/HomePage';


const App = () => {
  const token = localStorage.getItem('token');
  return (
    <Router>
      <div>
        <h1>Virtual Drive</h1>
        {/* Routes for Register and Login */}
        <Routes>
        <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/shareable-link/:token" element={<ShareableLinkPage/>} />

        </Routes>

        {/* Additional components */}
   

       
      </div>
    </Router>
  );
};

export default App;
