import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; 

const RenameFile = ({ fileId, setFiles, setShowRenameFile }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [newName, setNewName] = useState('');

    const handleRename = async () => {
        setIsLoading(true);
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            const response = await api.patch(`${baseUrl}/files/${fileId}/rename`, { name: newName }, config);
            console.log('File renamed:', response.data);

            // Update file structure in FilesList
            setFiles(prevFiles => prevFiles.map(file => {
                if (file.id === fileId) {
                    return { ...file, name: newName };
                }
                return file;
            }));
        } catch (error) {
            console.error('Error renaming file:', error);
        } finally {
            setIsLoading(false);
            setShowRenameFile(false);
        }
    };

    return (
        <div>
              <form onSubmit={(e) => {
                 e.preventDefault();
                handleRename();
            }}>
            <input type='text' value={newName} onChange={e => setNewName(e.target.value)} />
            </form>
        </div>
    );
}

export default RenameFile;   