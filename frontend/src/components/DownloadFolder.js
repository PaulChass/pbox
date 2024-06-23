import React from 'react';
import axios from 'axios';

const DownloadFolder = ({ folderId, noText }) => {


    const handleDownload = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/folders/${folderId}/download`, {
                responseType: 'blob', // Important for handling binary data
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Adjust for your authentication method
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `folder_${folderId}.zip`); // Adjust filename as needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading folder:', error);
        }
    };

    return (
        <button onClick={handleDownload}>  Download This Folder </button>
    );
};

export default DownloadFolder;
