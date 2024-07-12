import React, { useState, useEffect} from 'react';
import { Image } from 'react-bootstrap';


const Banner = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
  const user = localStorage.getItem('email');
   
    // change default behavior of the install prompt  
  useEffect(() => {
    const beforeInstallPromptHandler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      setInstallPrompt(e);
    };

    

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
        
        {installPrompt && (
        <button className="btn btn-primary" onClick={handleInstallClick}>
            Install App
        </button>
        
        )}
        </div>
    );
};

export default Banner;