import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; 
import { BsXCircle } from 'react-icons/bs';
import Form from 'react-bootstrap/Form';
import { FormControl } from 'react-bootstrap';

const RenameFolder = ({ folderId, setUpdated, setShowRename }) => {    
    const [folderName, setFolderName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRename = async () => {
        if(!folderName.trim()) {
            return;
        }
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
            setShowRename(false);

            
        } catch (error) {
            console.error('Error renaming folder:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Form style={{display:'flex'}} onSubmit={(e) => {
    e.preventDefault();
    handleRename();
}}>
            <FormControl
                type="text"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                onSubmit={handleRename}
                placeholder="New Folder Name"
                className='rename-input'
            />
            <BsXCircle style={{margin:'0.5rem'}} onClick={()=>{setShowRename(false)}}/>

           </Form>

        </div>
    );
}

export default RenameFolder;