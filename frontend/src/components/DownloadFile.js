import React, { useState } from 'react';
import api , { baseUrl } from '../api.js';

const DownloadFile = ({ file }) => {
    const [isLoading, setIsLoading] = useState(false);

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

return (<div>
    <button className='' onClick={handleDownload} disabled={isLoading}>
              {isLoading ? 'Downloading...' : 'Download'}
            </button>{isLoading && <p>Your file is downloading</p>}</div>    );
    };
    
    export default DownloadFile;