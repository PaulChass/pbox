import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import FolderTree from './components/FolderTree';

const App = () => {
  return (
    <Router>
      <div>
        <h1>Virtual Drive</h1>
        {/* Routes for Register and Login */}
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        {/* Additional components */}
   

        <FolderTree />
      </div>
    </Router>
  );
};

export default App;
