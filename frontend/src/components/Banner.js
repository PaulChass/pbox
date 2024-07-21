import React, { useState, useEffect} from 'react';
import { Image, Button } from 'react-bootstrap';


/**
 * Component for the site banner
 * 
 * @returns {JSX.Element} - Site banner
 * 
 * @example
 * return (
 *  <Banner />
 *  );  
 */
const Banner = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const email = localStorage.getItem('email');
  useEffect(() => {
    const beforeInstallPromptHandler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later.
      setInstallPrompt(e);
    };
    

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    };
  }, []);

  const handleInstallClick = () => {
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  const logoutClick = (e) => {
    e.preventDefault();
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
   
   return ( 
   <div className='flex-container'>
        <div>
        <a href='/'>
            <Image src={`${process.env.PUBLIC_URL}/images/logo.jpg`} alt="Site Logo" id='siteLogo' />
        </a>
        </div>
        
        {installPrompt  && (
        <Button className='btn btn-link'style={{height:'80px', margin:'auto 30px',color:'white'}} onClick={handleInstallClick}>
            Install App
        </Button>)}
        { !email
         && 
        (<div style={{alignContent:'center'}}>
            <a href='/login' style={{height:'80px', margin: 'auto 30px', color:'white',fontSize:'1.1rem' }}>
          Login  </a>
          <a href='/register' style={{height:'80px', margin: 'auto 30px', color:'white',fontSize:'1.1rem' }}>
          Register
          </a>
        </div>)
        }
        { email &&
        (<div style={{alignContent:'center'}}>
            <Button className='btn btn-link' onClick={(e)=>logoutClick(e)} style={{height:'80px', margin: 'auto 30px', color:'white',fontSize:'1.1rem' }}>
          Logout 
          </Button>
        </div>)
        }
              </div>
    );
};

export default Banner;