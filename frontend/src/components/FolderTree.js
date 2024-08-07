import React, {useState} from 'react';
import FolderContent from './FolderContent';




const FolderTree = () => {    
    const [folderId, setFolderId] = useState(null);

    const token = localStorage.getItem('token');
    return (
        <FolderContent 
            token={token} 
            folderId={folderId}
            setFolderId={setFolderId}
        />
    );
};

export default FolderTree;
