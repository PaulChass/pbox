import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import '../styles/DownloadFolder.css'; 
const DownloadFolder = ({ folderId, isLoading, setIsLoading, folderName }) => {

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`${baseUrl}/folders/${folderId}/download`, {
                responseType: 'blob', // Important for handling binary data
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Adjust for your authentication method
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${folderName}.zip`); // Adjust filename as needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading folder:', error);
        } finally {
            setIsLoading(false); // Step 3: Set loading to false after API call
        }
    };

    return (<div onClick={handleDownload} disabled={isLoading}>
          {isLoading ? 'Downloading...' : 'Download'}
            
        </div>    );
};

export default DownloadFolder;
