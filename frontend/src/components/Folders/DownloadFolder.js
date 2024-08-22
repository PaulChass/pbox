import React from 'react';
import api, { baseUrl } from '../../api.js'; // Adjust the path according to your file structure
import '../../styles/DownloadFolder.css';
const DownloadFolder = ({ folderId, isLoading, setIsLoading, folderName, setDownloadProgress }) => {

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`${baseUrl}/folders/${folderId}/download`, {
                responseType: 'blob', // Important for handling binary data
                onDownloadProgress: progressEvent => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`${percentCompleted}% downloaded`);
                    setDownloadProgress(percentCompleted);
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // Adjust for your authentication method
                }
            });
            console.log('Downloaded folder:', response);

            let filename = folderName + '.zip'; // Default filename if Content-Disposition is not found or parsed
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.setAttribute('download', filename); // Adjust filename as needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading folder:', error);
            alert('Error downloading folder, please refresh page and try again');
        } finally {
            //Reset download status
            setIsLoading(false);
            setDownloadProgress(0);
        }
    };

    return (<div onClick={handleDownload} disabled={isLoading}>
        {isLoading ? 'Downloading...' : 'Download'}

    </div>);
};

export default DownloadFolder;
