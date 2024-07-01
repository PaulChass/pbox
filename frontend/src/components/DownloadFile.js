import React, { useState } from 'react';
import api , { baseUrl } from '../api.js';

const DownloadFile = ({ file , isLoading ,setIsLoading }) => {

    const handleDownload = async () => {    
        setIsLoading(true);
        try {
            const response = await api.get(`${baseUrl}/files/download/${file.id}`, {
                responseType: 'blob',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.name); // Adjust filename as needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
        } finally {
            setIsLoading(false);
        }
    };

return (<div onClick={handleDownload}>
              {isLoading ? 'Downloading...' : 'Download'}
        </div>    );
        };
    
    export default DownloadFile;