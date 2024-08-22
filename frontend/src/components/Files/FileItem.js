import React, { useState, useCallback } from 'react';
import api, { baseUrl } from '../../api';
import { getFileNameWithoutExtension, getFileExtension, isVideoFile, isPDFOnMobileChrome } from './FileUtililities';
import FileActionsDropdown from './FileActionsDropdown';
import FileIcon from './FileIcon';
import RenameFile from './RenameFile';
import { truncateFileName } from './FileUtililities';

import '../../styles/FileItem.css';

/**
 * Represents a file item component.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.file - The file object.
 * @param {boolean} props.isMovable - Indicates if the file is movable.
 * @param {function} props.setFiles - The function to set the files.
 * @param {function} props.setIsLoading - The function to set the loading state.
 * @param {function} props.setDownloadProgress - The function to set the download progress.
 * @param {function} props.setIsMovable - The function to set the movable state.
 * @param {string} props.currentVideoUrl - The current video URL.
 * @param {function} props.setCurrentVideoUrl - The function to set the current video URL.
 * @param {function} props.setFrameTitle - The function to set the frame title.
 * @param {Object} props.frameRef - The reference to the frame element.
 * @returns {JSX.Element} The file item component.
 */
const FileItem = ({
    file,
    isMovable,
    setFiles,
    setIsLoading,
    setDownloadProgress,
    setIsMovable,
    currentVideoUrl,
    setCurrentVideoUrl,
    setFrameTitle,
    frameRef
}) => {
    const [showRenameFileId, setShowRenameFileId] = useState(null);
    const token = localStorage.getItem('token');
    const userAgent = navigator.userAgent;
    const isDesktop = window.innerWidth > 768;

    
    const handleDragStart = (e) => {
        const dragData = JSON.stringify({ id: file.id, type: 'files' });
        e.dataTransfer.setData('application/json', dragData);
    };

    const handleFileClick = useCallback(async () => {
        // Reset the video URL to null before setting the new video URL
        setCurrentVideoUrl(null);

        const container = document.querySelector('.frame');
        // Clear the iframe container before displaying the new file
        container.innerHTML = '';

        // Set the title of the frame to the file name
        setFrameTitle(getFileNameWithoutExtension(file.name));
        const fileExtension = getFileExtension(file.name);

        // Handle video files, PDFs on mobile Chrome, and other file types
        if (isVideoFile(fileExtension)) {
            handleVideoFile(file.id, currentVideoUrl, setCurrentVideoUrl);
        } else if (isPDFOnMobileChrome(fileExtension, userAgent)) {
            await handlePDFDownload(file.id, file.name, setIsLoading, setDownloadProgress);
        } else {
            await handleOtherFileTypes(file.id, setIsLoading, setDownloadProgress, frameRef);
        }
    }, [file.id, file.name, userAgent, setIsLoading, setDownloadProgress, currentVideoUrl, setCurrentVideoUrl, setFrameTitle]);


    const handleVideoFile = (fileId, currentVideoUrl, setCurrentVideoUrl) => {
        const videoUrl = `${baseUrl}/videos/${fileId}/stream`;
        
        if (currentVideoUrl) {
            // Reset the video URL to null before setting the new video URL
            setCurrentVideoUrl(null);

            setTimeout(() => setCurrentVideoUrl(videoUrl), 100);
        } else {
            setCurrentVideoUrl(videoUrl);
        }
    };

    const handlePDFDownload = async (fileId, fileName, setIsLoading, setDownloadProgress) => {
        setIsLoading(true);
        try {
            const response = await downloadFile(fileId, fileName, setDownloadProgress);
            createDownloadLink(response.data, fileName);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        } finally {
            setIsLoading(false);
            setDownloadProgress(0);
        }
    };

    const handleOtherFileTypes = async (fileId, setIsLoading, setDownloadProgress, frameRef) => {
        setIsLoading(true);
        try {
            const response = await downloadFile(fileId, '', setDownloadProgress);
            displayFileInIframe(response.data, frameRef);
        } catch (error) {
            console.error('Error handling other file types:', error);
        } finally {
            setIsLoading(false);
            setDownloadProgress(0);
        }
    };

    const downloadFile = (fileId, fileName = '', setDownloadProgress) => {
        let getUrl = `${baseUrl}/files/${fileName ? 'download/' : ''}${fileId}`;
        if (window.location.pathname.includes('shareable')) {
            getUrl = getUrl + `/${window.location.pathname.split('/')[2]}`;
        }

        return api.get(getUrl, {
            responseType: 'blob',
            onDownloadProgress: progressEvent => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setDownloadProgress(percentCompleted);
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    };

    const createDownloadLink = (fileBlob, fileName) => {
        const url = window.URL.createObjectURL(new Blob([fileBlob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const displayFileInIframe = (fileBlob, frameRef) => {
        const fileBlobUrl = window.URL.createObjectURL(fileBlob);
        const iframe = document.createElement('iframe');
        iframe.src = fileBlobUrl;
        
        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'iframeContainer';
        iframeContainer.style.height = 'auto';
    
        iframeContainer.appendChild(iframe);
    
        const closeButton = document.createElement('button');
        closeButton.className = 'btn btn-secondary closeButton';
        closeButton.addEventListener('click', () => {
            setFrameTitle(null);
            iframeContainer.remove();
        });
        closeButton.innerHTML = 'x';
    
        iframeContainer.appendChild(closeButton);
        iframe.onload = function () {
            const content = iframe.contentWindow || iframe.contentDocument;
            if (content) { iframeContainer.style.display = 'block'; }
            try {
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                var images = iframeDoc.querySelectorAll('img');
                images.forEach(function (img) {
                    img.className = 'iframeContainer img';
                    img.style.width = '100%';
                });
                const contentHeight = iframe.contentWindow.document.body.scrollHeight + 20;
                iframe.style.height = `${contentHeight}px`;
            }
            catch (error) {
                console.error('Error fetching file:', error);
            }
        };
        //set height of iframe container according to the content
        // get the height of the content
        const container = document.querySelector('.frame');
        container.innerHTML = '';
        container.appendChild(iframeContainer);
    
        // Delay the scroll action to ensure the iframe is fully rendered
        setTimeout(() => {
            frameRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
    };

    return (
        <li
            key={file.id}
            className="file-item"
            draggable={isMovable}
            onDragStart={handleDragStart}
            onDragOver={(e) => e.preventDefault()}
        >
            {showRenameFileId === file.id ? (
                // Display the RenameFile component if the file is being renamed
                <RenameFile fileId={file.id} fileName={file.name} setFiles={setFiles} setShowRenameFileId={setShowRenameFileId} setIsLoading={setIsLoading} />
            ) : (
                // Display the file name and actions dropdown
                <button onClick={() => handleFileClick()} className="file-name-button">
                        <span style={{ margin: '0.2rem' }}>
                            <FileIcon name={file.name} />
                            {isDesktop? file.name : truncateFileName(file.name)}  
                         </span>                
                
                </button>
            )}
            <FileActionsDropdown
                file={file}
                setFiles={setFiles}
                setIsLoading={setIsLoading}
                setDownloadProgress={setDownloadProgress}
                setIsMovable={setIsMovable}
                setShowRenameFileId={setShowRenameFileId}
            />
        </li>
    );
};

export default FileItem;