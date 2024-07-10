import React, {useState} from 'react';
import FolderContent from '../components/FolderContent';

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
        {!email && <p>You need to login to access your drive
            <a style={{ marginLeft: '20px' }} href="/login">Sign in</a>
            <a style={{ marginLeft: '20px' }} href="/Register">Sign up</a></p>}
    </div>
    )
}

export default HomePage;
