import React  from 'react';
import api, { baseUrl } from '../api.js';

const DownloadFile = ({ file, isLoading, setIsLoading, setDownloadProgress }) => {
    
    
    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`${baseUrl}/files/download/${file.id}`, {
                responseType: 'blob',
                onDownloadProgress: progressEvent => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`${percentCompleted}% downloaded`);
                    // Optionally, update state or call a function to display download progress
                    setDownloadProgress(percentCompleted);
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setDownloadProgress(0);

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name); // Adjust filename as needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
        } 
            setIsLoading(false);
            setDownloadProgress(0);
        
    };

    return (<div onClick={handleDownload}>
        Download
    </div>);
};

export default DownloadFile;