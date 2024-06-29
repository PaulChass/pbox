import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; 

const RenameFolder = ({ folderId, setUpdated }) => {    
    const [folderName, setFolderName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRename = async () => {
        setIsLoading(true);
        try {
            const requestData = { 
                name: folderName
            };

            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            const response = await api.patch(`${baseUrl}/folders/${folderId}/rename`, requestData, config);
            console.log('Folder renamed:', response.data);
            setUpdated(true);
            
        } catch (error) {
            console.error('Error renaming folder:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                placeholder="New Folder Name"
            />
            <button onClick={handleRename} disabled={isLoading}>
                {isLoading ? 'Renaming...' : 'Rename'}
            </button>
        </div>
    );
}

export default RenameFolder;