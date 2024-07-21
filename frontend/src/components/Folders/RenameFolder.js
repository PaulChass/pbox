import React, { useState } from 'react';
import api , { baseUrl } from '../../api.js'; 
import { BsXCircle } from 'react-icons/bs';
import Form from 'react-bootstrap/Form';
import { FormControl } from 'react-bootstrap';

const RenameFolder = ({ folderId, setShowRename, setFolders }) => {    
    const [folderName, setFolderName] = useState('');
    const token = localStorage.getItem('token');    
    
    const handleRename = async () => {
        if(!folderName.trim()) {
            return;
        }
        try {
            const requestData = { 
                name: folderName
            };

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            await api.patch(`${baseUrl}/folders/${folderId}/rename`, requestData, config);
            setFolders(prevFolders => prevFolders.map(folder => {
                if(folder.id === folderId) {
                    return { ...folder, name: folderName };
                }
                return folder;
            }));           
        } catch (error) {
            console.error('Error renaming folder:', error);
        }
        finally {
            setShowRename(false);
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