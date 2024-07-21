import React, { useState, useCallback, useRef } from 'react';
import api, { baseUrl } from '../../api';
import { getFileNameWithoutExtension, getFileExtension, isVideoFile, isPDFOnMobileChrome } from './FileUtililities';
import FileActionsDropdown from './FileActionsDropdown';
import FileIcon from './FileIcon';
import RenameFile from './RenameFile';
import { truncateFileName } from './FileUtililities';

import '../../styles/FileItem.css';

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
    // Drag and drop file
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
        //if url contains shareable link
        if (window.location.pathname.includes('shareable')) {
            //add link to the url
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
        iframe.style.width = '100%';
        iframe.style.minHeight = window.innerWidth > 768 ? '100vh' : '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';

        const iframeContainer = document.createElement('div');
        iframeContainer.className = 'iframeContainer';

        iframeContainer.appendChild(iframe);
        iframeContainer.style.display = 'none';

        const closeButton = document.createElement('button');
        closeButton.className = 'btn btn-secondary';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.zIndex = '10';
        closeButton.style.fontSize = '1.2em';
        closeButton.addEventListener('click', () => {
            setFrameTitle(null);
            iframeContainer.remove();
        });
        closeButton.innerHTML = 'x';
        closeButton.style.paddingTop = '0';
        closeButton.style.paddingBottom = '0';

        iframeContainer.appendChild(closeButton);
        iframe.onload = function () {
            const content = iframe.contentWindow || iframe.contentDocument;
            if (content) { iframeContainer.style.display = 'block'; };
            try {
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                var images = iframeDoc.querySelectorAll('img');
                images.forEach(function (img) {
                    img.style.display = 'block';
                    img.style.webkitUserSelect = 'none';
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '100%';
                    img.style.objectFit = 'contain';
                    img.style.margin = 'auto';
                });
            }
            catch (error) {
                console.error('Error fetching file:', error);
            }
        };
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