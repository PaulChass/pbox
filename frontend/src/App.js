/**
 * @file App.js is the root component of the application.
 * It sets up the router and defines routes for different pages in the application.
 * 
 * It also imports the Bootstrap CSS file and the custom CSS file.
 * 
 * It also imports the Banner component which is displayed at the top of the page.
 * 
 * It also imports the HomePage, Register, Login, and ShareableLinkPage components which are used as pages in the application.
 * 
 * It also uses the BrowserRouter, Routes, and Route components from react-router-dom to define the routes.
 * 
 * @see {@link https://reactrouter.com/web/guides/quick-start|React Router Quick Start}
 * @see {@link https://getbootstrap.com/docs/5.0/getting-started/introduction/|Bootstrap Introduction}
 * @see {@link Banner}
 * @see {@link HomePage}
 * @see {@link Register}
 * @see {@link Login}
 * @see {@link ShareableLinkPage}
 * @see {@link BrowserRouter}
 * @see {@link Routes}
 * 
 * @module App
 * @requires react
 *  
 * 
 *  */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'drag-drop-touch';

// Page components
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import ShareableLinkPage from './pages/ShareableLinkPage';

// Component imports
import Banner from './components/Banner';

/**
 * App component serves as the root of the application.
 * It sets up the router and defines routes for different pages in the application.
 */
const App = () => {
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
          {/* Nested routes for shareable link access */}
          <Route path="/shareable-link/:token/login" element={<Login />} />
          <Route path="/shareable-link/:token/register" element={<Register />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;