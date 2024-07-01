import React , {useState} from 'react';
import { useParams } from 'react-router-dom';
import FolderContent from '../components/FolderContent';
import { baseUrl } from '../api.js';

const ShareableLinkPage = () => {
    const { token } = useParams();
    const [folderId, setFolderId] = useState(null);

    localStorage.setItem('tokenUrl', token);
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
