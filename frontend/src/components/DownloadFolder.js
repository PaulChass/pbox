import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import '../css/DownloadFolder.css'; 
const DownloadFolder = ({ folderId, noText }) => {
    const [isLoading, setIsLoading] = useState(false);

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
            link.setAttribute('download', `folder_${folderId}.zip`); // Adjust filename as needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading folder:', error);
        } finally {
            setIsLoading(false); // Step 3: Set loading to false after API call
        }
    };

    return (<div>
<button className='bigButton' onClick={handleDownload} disabled={isLoading}>
          {isLoading ? 'Downloading...' : 'Download'}
        </button>{isLoading && <h3>Be patient... this could take a while 😉</h3>}</div>    );
};

export default DownloadFolder;
