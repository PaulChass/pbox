import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { BsFolderPlus, BsXCircle } from 'react-icons/bs';
import Form from 'react-bootstrap/Form';
const CreateFolder = ({ setFolders, folderId }) => {
    const [folderName, setFolderName] = useState('');
    const [showFolderForm, setShowFolderForm] = useState(false);
    const token = localStorage.getItem('token');   
    const [errorMessage, setErrorMessage] = useState(''); // State to hold error message

       const handleCreateFolder = async () => {

        if(!folderName) {   
            return;
        }   
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
            setShowFolderForm(false);
            // Call setFolders to update structure in FolderTree
            setFolders(prevFolders => [...prevFolders, response.data]); // Assuming response.data is the new folder object
        } catch (error) {
            console.error('Error creating folder:', errorMessage);
        }
    };

    return (
        <div style={{display:'flex',width: '18rem',margin:'0 auto',justifyContent:'center'}}>
            {showFolderForm ?
                <Form onSubmit={(e) => { e.preventDefault(); handleCreateFolder(); }} style={{display:'flex',margin:'1rem'}}>            
                <Form.Control
                type="text"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                placeholder="New folder name" 
                className='rename-input'
            /> 
            <BsXCircle style={{margin:'0.5rem'}} onClick={()=>{setShowFolderForm(false)}}/>

            </Form> :
            <span style={{textDecoration: 'underline', marginBottom:'2rem'}} onClick={() => {setShowFolderForm(prevState => !prevState)}}>Create new folder</span>
            }
        </div>
    );
};

export default CreateFolder;
