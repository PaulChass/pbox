import React, { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'react-bootstrap/Image';
import './App.css';
import 'drag-drop-touch';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'; // Assuming you have this component
import Login from './pages/Login'; // Assuming you have this component
import Banner from './components/Banner'; // Assuming you have this component
import ShareableLinkPage from './pages/ShareableLinkPage'; // Assuming you have this component
import { isMobileSafari, isFirefox, isSamsungBrowser } from 'react-device-detect'; // This library helps with device detection

const App = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const user = localStorage.getItem('email');

  console.log(navigator.userAgent);
  console.log(localStorage.getItem('email'));

  document.title = 'Drive';
  return (
    <div>
    <Banner />    
  <Router>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/shareable-link/:token" element={<ShareableLinkPage />} />
    </Routes>
  </Router>
    </div >
  );
};

export default App;