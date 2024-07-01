import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { Button } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
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

            const response = await api.post(`${baseUrl}/folders/`, requestData, config);
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
        <div style={{display:'flex',width:'80%',margin:'0 auto',justifyContent:'center'}}>
            <Form.Control
                type="text"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                placeholder="Folder Name"
            />
            
            <Button onClick={handleCreateFolder}>Create</Button>
        </div>
    );
};

export default CreateFolder;
