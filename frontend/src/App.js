import React, { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import 'bootstrap/dist/css/bootstrap.min.css';
import Image from 'react-bootstrap/Image';
import './App.css';
import 'drag-drop-touch';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'; // Assuming you have this component
import Login from './pages/Login'; // Assuming you have this component
import ShareableLinkPage from './pages/ShareableLinkPage'; // Assuming you have this component
import { isMobileSafari, isFirefox, isSamsungBrowser} from 'react-device-detect'; // This library helps with device detection

const App = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showFallback, setShowFallback] = useState(false);

  console.log(navigator.userAgent);
  useEffect(() => {
    const beforeInstallPromptHandler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
     // Check if the browser is Safari on iOS or Firefox and set the fallback flag
     if (isMobileSafari || isFirefox || isSamsungBrowser) {
      setShowFallback(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    };
  }, []);

  const handleInstallClick = () => {
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult) => {
    
      setInstallPrompt(null);
    });
  };

  document.title = 'Drive';
  return (
    <div>
      <div className='flex-container'>
        <a href='/'>
          <Image src={`${process.env.PUBLIC_URL}/images/logo.jpg`} alt="Site Logo" id='siteLogo' />
        </a>
        <div style={{ width: '100%' }}></div>
        {installPrompt && (
          <button className="btn btn-primary" onClick={handleInstallClick}>
            Install App
          </button>
        )}
       
      </div>
      {showFallback && (
        <div className="fallback-install-instructions">
          {/* Customize this message based on the browser */}
          {isMobileSafari && (
            <p>To install the app, tap the Share button and then 'Add to Home Screen'.</p>
          )}
          {(isFirefox || isSamsungBrowser)&& (
            <p>To install the app, open the menu and select 'Add to Home Screen'.</p>
          )}  
        </div>
      )}
      <Router>
        <div>

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/shareable-link/:token" element={<ShareableLinkPage />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;