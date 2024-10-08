import React, { useState } from 'react';
import api , { baseUrl } from '../../api.js'; // Adjust the path according to your file structure

const DeleteFolder = ({ folderId, setFolders }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this folder?')===false) {
            return;
        }
        
        setIsLoading(true);
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            const response = await api.delete(`${baseUrl}/folders/${folderId}/delete`, config);
            console.log('Folder deleted:', response.data);

            // Update folder structure in FolderTree
            setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));
        } catch (error) {
            console.error('Error deleting folder:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div onClick={handleDelete} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete'}
            {isLoading && <p>Your folder is being deleted</p>}
        </div>
    );
};

export default DeleteFolder;