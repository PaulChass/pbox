import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { useNavigate } from 'react-router-dom';
import { Form, FormControl, Button, Container, Row } from 'react-bootstrap';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Get the history object

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`${baseUrl}/auth/login`, { email, password });
      alert('Login successful');
      localStorage.setItem('email', email); // Store username in localStorage
      localStorage.setItem('token', response.data.token); // Store token in localStorage
      navigate('/');

    } catch (error) {
      console.error(error);
      alert('Error logging in');
    }
  };

  return (<div>
    <Container id='login'>
    <Row>
      <h2 className='driveTitle'>Login </h2>
    </Row>
    <Form onSubmit={handleSubmit}>
     <Form.Control
   type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <FormControl type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      <Button type="submit">Login</Button>
    </Form>
    </Container>
    <Row className='center'>You dont have an account ?    <a className='center' href="/register"><Button className='btn'>Sign up</Button></a></Row>
    </div>
  );
};

export default Login;
