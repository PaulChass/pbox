import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Get the history object

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      alert('Login successful');
      localStorage.setItem('email', email); // Store username in localStorage
      localStorage.setItem('token', response.data.token);
      if(localStorage.getItem('tokenUrl')!==undefined && localStorage.getItem('tokenUrl') !== '')
        {
          window.location.replace('http://localhost:3000/shareable-link/'+localStorage.getItem('tokenUrl'))
        }
      
      navigate('/');

    } catch (error) {
      console.error(error);
      alert('Error logging in');
    }
  };

  return (<div>
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p>You dont have an account ?    <a style={{marginLeft:'20px'}} href="/Register">Sign up</a></p>
    </div>
  );
};

export default Login;
