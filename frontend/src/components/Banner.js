import React, { useState, useEffect} from 'react';
import { isMobileSafari, isFirefox, isSamsungBrowser } from 'react-device-detect'; // This library helps with device detection
import { Image } from 'react-bootstrap';


const Banner = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const user = localStorage.getItem('email');
   
    // change default behavior of the install prompt  
  useEffect(() => {
    const beforeInstallPromptHandler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    if (isMobileSafari || isFirefox || isSamsungBrowser) {
      setShowFallback(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    };
  }, []);

  const handleInstallClick = () => {
      if (installPrompt) {
          installPrompt.prompt();
          // Wait for the user to respond to the prompt
          installPrompt.userChoice.then((choiceResult) => {
              setInstallPrompt(null);
          });
      }
  };
   
   return ( 
   <div className='flex-container'>
        <div>
        <a href='/'>
            <Image src={`${process.env.PUBLIC_URL}/images/logo.jpg`} alt="Site Logo" id='siteLogo' />
        </a>
        </div>
        <div style={{ marginTop: '4rem', marginRight: '2rem', fontSize: 'small' }}>
        {user !== undefined ? 'Connected as :' + user 
            :
            <a href='/login'>Login</a>}
        </div>
    
        {installPrompt && (
        <button className="btn btn-primary" onClick={handleInstallClick}>
            Install App
        </button>
        
        )}
        {
    false && (
      <div className="fallback-install-instructions">
        {/* Customize this message based on the browser */}
        {isMobileSafari && (
          <p>To install the app, tap the Share button and then 'Add to Home Screen'.</p>
        )}
        {(isFirefox || isSamsungBrowser) && (
          <p>To install the app, open the menu and select 'Add to Home Screen'.</p>
        )}
      </div>
    )
  }
    </div>
    );
};

export default Banner;