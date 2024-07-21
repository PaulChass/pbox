import React, { useState } from 'react';
import api , { baseUrl } from '../../api.js'; 

/**
 * Component for renaming a file
 * 
 * @param {Object} props
 * @param {string} props.fileId - The id of the file to rename
 * 
 * @returns {JSX.Element} - Rename file input
 * 
 * @example
 * return <RenameFile fileId={fileId} fileName={fileName} setFiles={setFiles} setShowRenameFileId={setShowRenameFileId} setIsLoading={setIsLoading} />;
 */
const RenameFile = ({ fileId, fileName ,setFiles, setShowRenameFileId, setIsLoading }) => {
    const [newName, setNewName] = useState(fileName);

    const handleRename = async () => {
        setIsLoading(true);
        const originalFileExtension = fileName.split('.').pop();
        let newNameWithoutExtension = newName.split('.').slice(0, -1).join('');
        setNewName(`${newNameWithoutExtension}.${originalFileExtension}`);

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            };
            let nameToSend = newName;  

            // add the original file extension if needed
            if (!newName.includes('.')) {
              nameToSend = newName + '.' + originalFileExtension;
            }
            // Send the new name to the server
            await api.patch(`${baseUrl}/files/${fileId}/rename`, { name: nameToSend }, config);

            // Update file structure in FilesList
            setFiles(prevFiles => prevFiles.map(file => {
                if (file.id === fileId) {
                    return { ...file, name: nameToSend };
                }
                return file;
            }));
        } catch (error) {
            console.error('Error renaming file:', error);
        } finally {
            setIsLoading(false);
            setShowRenameFileId(null);
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