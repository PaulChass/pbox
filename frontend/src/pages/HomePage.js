import React, {useState} from 'react';
import Drive from '../components/Drive';
import AuthMessage from '../components/AuthMessage';

const HomePage = () => {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    const [folderId, setFolderId] = useState(null);

    return (<div>
        {email && <Drive 
            token={token} 
            folderId={folderId}
            setFolderId={setFolderId}
        />}
        {!email && 
                <AuthMessage/>}
    </div>
    )
}

export default HomePage;
