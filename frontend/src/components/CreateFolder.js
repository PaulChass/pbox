import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { Button, Alert } from 'react-bootstrap';
import { BsFolderPlus } from 'react-icons/bs';
import Form from 'react-bootstrap/Form';
const CreateFolder = ({ setFolders, folderId }) => {
    const [folderName, setFolderName] = useState('');
    const [showFolderForm, setShowFolderForm] = useState(false);
    const token = localStorage.getItem('token');   
    const [errorMessage, setErrorMessage] = useState(''); // State to hold error message


    const handleCreateFolder = async () => {
        try {
            const requestData = { 
                name: folderName,
                parent_id: folderId,
                email: localStorage.getItem('email')
            };

             // Check if folderName is empty
        if (!folderName.trim()) {
            setErrorMessage('Folder name cannot be empty.'); // Set error message
            return; // Prevent form submission
        }
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
            setShowFolderForm(false);
            // Call setFolders to update structure in FolderTree
            setFolders(prevFolders => [...prevFolders, response.data]); // Assuming response.data is the new folder object
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    return (
        <div style={{display:'flex',width: '18rem',margin:'0 auto',justifyContent:'center'}}>
            {showFolderForm ?
            <Form onSubmit={handleCreateFolder}>
            <Form.Control
                type="text"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                placeholder="Folder Name"
            />
            </Form> :
            <BsFolderPlus style={{fontSize:'3rem', margin:'1rem',marginRight:'3rem'}} onClick={() => {setShowFolderForm(prevState => !prevState)}}/>
            }
            
            
        </div>
    );
};

export default CreateFolder;
