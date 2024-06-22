import React, { useState } from 'react';
import axios from 'axios';

const CreateFolder = ({ setFolders, folderId }) => {
    const [folderName, setFolderName] = useState('');
    const token = localStorage.getItem('token');   

    const handleCreateFolder = async () => {
        try {
            const requestData = { 
                name: folderName,
                parent_id: folderId,
                email: localStorage.getItem('email')
            };

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            };

            const response = await axios.post('http://localhost:5000/api/folders/', requestData, config);
            console.log('Folder created:', response.data);

            // Clear input fields after successful creation
            setFolderName('');

            // Call setFolders to update structure in FolderTree
            setFolders(prevFolders => [...prevFolders, response.data]); // Assuming response.data is the new folder object
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                placeholder="Folder Name"
            />
            
            <button onClick={handleCreateFolder}>Create</button>
        </div>
    );
};

export default CreateFolder;
