import React  from 'react';
import api, { baseUrl } from '../../api.js';
import { BsDownload } from 'react-icons/bs';    

const DownloadFile = ({ file, setIsLoading, setDownloadProgress, icon }) => {
    
    
    const handleDownload = async () => {
        setIsLoading(true);
        //get token from url
        // if url contains shareable link
        let posturl = `${baseUrl}/files/download/${file.id}/`;

        if(window.location.pathname.includes('shareable')){
            //add link to the url
            let token = window.location.pathname.split('/')[2];
            posturl = posturl + `${token}`;
        }
        try {
            const response = await api.get(posturl, {
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
            link.target = '_blank'; // Ensure the file opens in a new tab
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file, refresh and try again', error);
        } 
        finally {
            setIsLoading(false);
            setDownloadProgress(0);
        }
    };
 
    return (<div onClick={handleDownload}>
        {icon ? <BsDownload style={{marginLaft:'2rem'}}/>:'Download'}
    </div>);
}

export default DownloadFile;