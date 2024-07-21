import React , {useState} from 'react';
import Drive from '../components/Drive';

/**
 * ShareableLinkPage component is a page that displays the content of a shared folder.
 * 
 * @returns {JSX.Element} - ShareableLinkPage component
 */

const ShareableLinkPage = () => {
    const [folderId, setFolderId] = useState(null);
    const authToken = localStorage.getItem('token');
    
    return (
        <Drive 
            token={authToken}
            folderId={folderId}
            setFolderId={setFolderId}
            shared = {true} // Start from the shared folder
        />
    );
};

export default ShareableLinkPage;
