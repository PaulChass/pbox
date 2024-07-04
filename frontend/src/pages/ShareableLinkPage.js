import React , {useState} from 'react';
import FolderContent from '../components/FolderContent';

const ShareableLinkPage = () => {
    const [folderId, setFolderId] = useState(null);

    
    const authToken = localStorage.getItem('token');


    

    return (
        <FolderContent 
            token={authToken}
            folderId={folderId}
            setFolderId={setFolderId}
            shared = {true} // Start from the shared folder
        />
    );
};

export default ShareableLinkPage;
