import React, { useState } from 'react';
import api, { baseUrl } from '../../api.js';

/**
 * 
 * @param {Object} props
 * @param {number} props.fileId - The id of the file to delete
 * @param {Function} props.setFiles - Function to update the files list
 *  
 * @returns {JSX.Element} - Delete file button
 * 
 * @example
 * return <DeleteFileButton fileId={fileId} setFiles={setFiles} />;
 * 
 */
const DeleteFileButton = ({ fileId, setFiles }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };

            const response = await api.delete(`${baseUrl}/files/${fileId}/delete`, config);
            console.log('File deleted:', response.data);

            // Update file structure in FilesList
            setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
        } catch (error) {
            console.error('Error deleting file:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div onClick={handleDelete} >
            <span>
                {isLoading ? 'Deleting...' : 'Delete'}
            </span>
            {isLoading && <p>Your file is being deleted</p>}
        </div>
    );
}

export default DeleteFileButton;