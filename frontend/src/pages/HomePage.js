import React, {useState} from 'react';
import FolderContent from '../components/FolderContent';
import { Button } from 'react-bootstrap';

const HomePage = ({ }) => {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    const [folderId, setFolderId] = useState(null);

    return (<div>
        {email && <FolderContent 
            token={token} 
            folderId={folderId}
            setFolderId={setFolderId}
        />}
        {!email &&   <div>
                <h2 className='driveTitle'>My drive</h2>
                <p style={{ color: 'black' }}> 
                    <span>You need to Sign In to access your drive</span>
                    <a href='/login' style={{ marginLeft: '10px', marginRight: '10px' }}>
                        <Button> Sign in</Button></a>
                    <a href='/register'>
                        <Button>Register</Button></a>
                </p>
            </div>}
    </div>
    )
}

export default HomePage;
