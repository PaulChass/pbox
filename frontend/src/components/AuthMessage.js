import React from 'react';
import { Button } from 'react-bootstrap';
const AuthMessage = ({ shared, url }) => {
    return (
        <div>
            <h2 className='driveTitle'>My drive</h2>
            <p style={{ color: 'black' }}>
                <span>You need to Sign In to access this drive</span>
                <a href={shared ? `/shareable-link/${url}/login` : `/login`} style={{ marginLeft: '10px', marginRight: '10px' }}>
                    <Button>Sign in</Button>
                </a>
                <a href={shared ? `/shareable-link/${url}/register` : `/register`} style={{ marginLeft: '10px', marginRight: '10px' }}>
                    <Button>Register</Button>
                </a>
            </p>
        </div>
    );
};

export default AuthMessage;