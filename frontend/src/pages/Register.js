import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Get the history object

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
      alert('User registered successfully');
      if(localStorage.getItem('tokenUrl')!==undefined)
        {
          window.location.replace('http://localhost:3000/shareable-link/'+localStorage.getItem('tokenUrl'))
        }
      
      navigate('/');

    } catch (error) {
      console.error(error);
      alert('Error registering user');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Register</button>
      <p>You already have an account ?    <a style={{marginLeft:'20px'}} href="/Login">Sign in</a></p>

    </form>
  );
};

export default Register;
