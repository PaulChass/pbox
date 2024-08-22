/**
 * DownloadFile component for downloading files.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.file - The file object to be downloaded.
 * @param {Function} props.setIsLoading - The function to set the loading state.
 * @param {Function} props.setDownloadProgress - The function to set the download progress.
 * @param {boolean} props.icon - Flag to determine whether to display an icon or not.
 * @returns {JSX.Element} The DownloadFile component.
 */
import React from 'react';
import api, { baseUrl } from '../../api.js';
import { BsDownload } from 'react-icons/bs';

/**
 * DownloadFile component.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.file - The file object to be downloaded.
 * @param {Function} props.setIsLoading - The function to set the loading state.
 * @param {Function} props.setDownloadProgress - The function to set the download progress.
 * @param {boolean} props.icon - Flag indicating whether to display an icon or text for the download button.
 * @returns {JSX.Element} The DownloadFile component.
 */
const DownloadFile = ({ file, setIsLoading, setDownloadProgress, icon }) => {
    
    const constructPostUrl = () => {
        let posturl = `${baseUrl}/files/download/${file.id}/`;
        if (window.location.pathname.includes('shareable')) {
            const token = window.location.pathname.split('/')[2];
            posturl += token;
        }
        return posturl;
    };

    /**
     * Checks if a file path corresponds to a video file.
     *
     * @param {string} filePath - The file path to check.
     * @returns {boolean} - Returns true if the file path corresponds to a video file, otherwise returns false.
     */
    const isVideoFile = (filePath) => {
        const videoExtensions = ['mp4', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'webm'];
        return videoExtensions.some(ext => filePath.endsWith(ext));
    };

    /**
     * Downloads a file from the server.
     * 
     * @async
     * @function handleDownload
     * @returns {Promise<void>} - A promise that resolves when the file is downloaded successfully or rejects with an error.
     */
    const handleDownload = async () => {
        setIsLoading(true);
        let posturl = constructPostUrl();
        if (isVideoFile(file.path)) {
            let posturl = constructPostUrl();
            posturl = `${baseUrl}/videos/${file.id}/downloadVideo`;
            let a = document.createElement('a');
            a.href = posturl;
            a.target = '_blank';
            a.click();
            return;
        }

        try {
            const response = await api.get(posturl, {
                responseType: 'blob',
                onDownloadProgress: progressEvent => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`${percentCompleted}% downloaded`);
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
            console.error('Error downloading file', error);
            alert('Error downloading file, please refresh page and try again');
        }
        finally {
            setIsLoading(false);
            setDownloadProgress(0);
        }
    };

    return (<div onClick={handleDownload}>
        {icon ? <BsDownload /> : 'Download'}
    </div>);
}

export default DownloadFile;