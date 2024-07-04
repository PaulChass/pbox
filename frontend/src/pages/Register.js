import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { Form, FormControl, Button, Container, Row } from 'react-bootstrap';
import '../styles/Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Get the history object

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${baseUrl}/auth/register`, { username, email, password });      alert('User registered successfully');      
     
      if(localStorage.getItem('tokenUrl')) {
          window.location.replace('http://localhost:3000/shareable-link/'+localStorage.getItem('tokenUrl'))
        }
      
      else{navigate('/login')};
       

    } catch (error) {
      console.error(error);
      alert('Error registering user');
    }
  };

  return (<div>
    <Container id="register">
    <Row>
    <h2 className='driveTitle'>Register</h2>
    </Row>
    <Form onSubmit={handleSubmit}>
      <FormControl type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <FormControl type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <FormControl type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <Button type="submit">Register</Button>
      </Form>
    </Container>
      <Row className='center'>You already have an account ?    
        <a className='center' href="/login">
      <Button className='btn'>Sign In</Button>
        </a></Row>
    </div>
  );
};

export default Register;
