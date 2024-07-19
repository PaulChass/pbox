import React, { useState, useEffect, useRef } from 'react';
import api, { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import FileUpload from './FileUpload';
import DownloadFile from './DownloadFile';
import DeleteFile from './DeleteFile';
import RenameFile from './RenameFile';
import { Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import '../styles/FileList.css';
import { Dropdown } from 'react-bootstrap';
import * as BsIcons from "react-icons/bs";
import { BsThreeDotsVertical } from 'react-icons/bs';

const FilesList = ({ folderId, showUpload, setIsLoading, updated, setUpdated,
    showRenameFile, setShowRenameFile, isMovable, setIsMovable,
    setDownloadProgress

}) => {
    const [files, setFiles] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [error, setError] = useState(null);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
    const token = localStorage.getItem('token');
    const location = useLocation();
    const spinnerRef = useRef(null);
    const frameRef = useRef(null);

    const userAgent = navigator.userAgent;





    const [showRenameFileId, setShowRenameFileId] = useState(null);



    useEffect(() => {
        setShowVideoPlayer(false);
        setCurrentVideoUrl(null);
        setIsFetching(true);
        fetchFiles();
    }, [folderId, location.pathname, updated, refresh]);



    const handleClick = (id, type) => {
        if (type === 'move') {
            setIsMovable(true);
            alert('You can now drag folders and files to another folder.');
        }
        if (type === 'renameFile') {
            setShowRenameFileId(id);
            setShowRenameFile(true);
        }
    };


    const fetchFiles = async () => {
        try {
            let posturl = `${baseUrl}/folders/${folderId}/files`;

            const response = await api.get(posturl, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });

            setFiles(response.data);
        } catch (err) {
            setError(err);
        } finally {
            setIsFetching(false);
            setUpdated(false);
            setRefresh(false);
        }
    };

    const truncateFileName = (name) => {
        if (name.length > 20) {
            return name.substring(0, 15) + '...' + name.substring(name.length - 5, name.length);
        }
        return name;
    }

    const fileType = (name) => {
        const ext = name.split('.').pop();
        return ext;
    }

    function getFileIcon(name) {
        switch (fileType(name)) {
            case 'pdf':
                return <BsIcons.BsFileEarmarkPdf style={{ marginRight: '5px' }} />;
            case 'doc':
                return <BsIcons.BsFileEarmarkWord style={{ marginRight: '5px' }} />;
            case 'docx':
                return <BsIcons.BsFileEarmarkText style={{ marginRight: '5px' }} />;
            case 'txt':
                return <BsIcons.BsFileEarmarkText style={{ marginRight: '5px' }} />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <BsIcons.BsFileEarmarkImage style={{ marginRight: '5px' }} />;
            case 'svg':
            case 'json':
            case 'js':
            case 'css':
            case 'html':
            case 'xml':
            case 'php':
                return <BsIcons.BsFileEarmarkCode style={{ marginRight: '5px' }} />;

            case 'mp4':
            case 'avi':
            case 'mkv':
                return <BsIcons.BsFileEarmarkPlay style={{ marginRight: '5px' }} />;
            case 'mp3':
            case 'wav':
                return <BsIcons.BsFileEarmarkMusic style={{ marginRight: '5px' }} />;
            case 'zip':
            case 'rar':
                return <BsIcons.BsFileEarmarkZip style={{ marginRight: '5px' }} />;
            case 'xlsx':
            case 'xls':
                return <BsIcons.BsFileEarmarkSpreadsheet style={{ marginRight: '5px' }} />;
            case 'ppt':
            case 'pptx':
                return <BsIcons.BsFileEarmarkPpt style={{ marginRight: '5px' }} />;
            default:
                return <BsIcons.BsFileEarmark style={{ marginRight: '5px' }} />;
        }
    }

    const displayFile = (name) => {
        const truncatedName = truncateFileName(name);
        return (
            <span style={{ margin: '0.2rem' }}>
                {getFileIcon(name)}
                {truncatedName}
            </span>
        );
    }

    const handleFileClick = async (fileId, fileName) => {
        const fileExtension = fileName.split('.').pop();
        if (fileExtension === 'mp4' || fileExtension === 'avi' || fileExtension === 'mkv') {
            // Check if a video is currently being played
            if (showVideoPlayer && currentVideoUrl) {
                setCurrentVideoUrl(null);
                setShowVideoPlayer(false);
                // Use a timeout to ensure the previous video is properly reset before setting the new URL
                setTimeout(() => {
                    const videoUrl = `${baseUrl}/files/${fileId}/stream`;
                    setCurrentVideoUrl(videoUrl);
                    setShowVideoPlayer(true);
                }, 100);
            } else {
                const videoUrl = `${baseUrl}/files/${fileId}/stream`;
                setCurrentVideoUrl(videoUrl);
                setShowVideoPlayer(true);
            }
        }
        // If pdf on chrome or samsung mobile, download the file
        else if (fileExtension === 'pdf' 
            && (userAgent.includes('Chrome') || userAgent.includes('Samsung'))
            && userAgent.includes('Android')) {
            const file = { id: fileId, name: fileName };
            setIsLoading(true);
            try {
                const response = await api.get(`${baseUrl}/files/download/${file.id}`, {
                    responseType: 'blob',
                    onDownloadProgress: progressEvent => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
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
                console.error('Error downloading file, refresh and try again', error);
            }
            finally {
                setIsLoading(false);
                setDownloadProgress(0);
            }
        }
        else {
            try {
                let getUrl = `${baseUrl}/files/${fileId}`;
                setIsLoading(true);
                const response = await api.get(getUrl, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                    responseType: 'blob', // Ensure Axios treats the response as a Blob
                    withCredentials: true,
                    onDownloadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setDownloadProgress(percentCompleted);
                    }
                });

                // Assuming Axios or similar, the actual Blob is in response.data
                const fileBlob = response.data; // Directly use the Blob from the response
                const fileBlobUrl = window.URL.createObjectURL(fileBlob);

                // Create an iframe and set its source to the Blob URL
                const iframe = document.createElement('iframe');
                iframe.src = fileBlobUrl;
                iframe.style.width = '100%';
                iframe.style.minHeight = '300px'; // Adjust the height as needed
                iframe.style.border = 'none';



                // Create a container for the iframe and the close button
                const iframeContainer = document.createElement('div');
                iframeContainer.className = 'iframeContainer'; // So the close button can be absolutely positioned within

                // Append the iframe to the container
                iframeContainer.appendChild(iframe);
                iframeContainer.style.display = 'none'; // Hide the container initially

                // Create the close button
                const closeButton = document.createElement('button');
                closeButton.className = 'btn btn-secondary'
                closeButton.style.position = 'absolute';
                closeButton.style.top = '10px'; // Adjust as needed
                closeButton.style.right = '10px'; // Adjust as needed
                closeButton.style.zIndex = '10'; // Ensure it's above the iframe
                closeButton.style.fontSize = '1.2em'; // Adjust as needed
                // Create the X icon element using React.createElement since we are manipulating DOM directly
                // Add click event listener to remove the iframe and the container
                closeButton.addEventListener('click', () => {
                    iframeContainer.remove();
                });
                closeButton.className = 'btn btn-secondary';
                closeButton.innerHTML = 'x';
                closeButton.style.paddingTop = '0';
                closeButton.style.paddingBottom = '0';

                // Append the close button to the container
                iframeContainer.appendChild(closeButton);
                iframe.onload = function () {
                    const content = iframe.contentWindow || iframe.contentDocument;
                    if (content) { iframeContainer.style.display = 'block'; };
                    try {
                        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        var images = iframeDoc.querySelectorAll('img'); 
                        // Add a classname to each image
                        images.forEach(function (img) {
                            img.style.display = 'block';
                            img.style.webkitUserSelect = 'none';
                            img.style.maxWidth = '100%';
                            img.style.maxHeight = '100%';
                            img.style.objectFit = 'contain';
                            img.style.margin = 'auto';
                        });
                    } catch (error) {
                        console.error('Error accessing iframe content:', error);
                    }
                };

                // Append the container to the document, replacing iframe append
                const container = document.querySelector('.frame'); // Ensure you have a container with the class 'section'
                container.innerHTML = ''; // Clear the container's content
                container.appendChild(iframeContainer);
            } catch (error) {
                console.error('Error fetching file:', error);
                // Check if important element exists in the iframe
            }


            setDownloadProgress(0);
            setIsLoading(false);
            frameRef.current?.scrollIntoView({ behavior: 'smooth' }); // Scroll to the spinner
        }
    };

    if (isFetching) {
        return (<Spinner animation="border" role="status">
            <span className="visually-hidden">
                Loading...</span>
        </Spinner>);
    } else {
        return (
            <div className='section' ref={frameRef}>

                <div className='frame' ></div>
                {showVideoPlayer && (
                    <video width="320" height="240" controls>
        
                        <source src={currentVideoUrl} type="video/mp4"/>    
                        Your browser does not support the video tag.
                    </video>
                )}
                <span>
                    {files.sort((a, b) => a.name.localeCompare(b.name)).map(file => (
                        <li key={file.id} style={{ display: 'flex', justifyContent: 'center' }}
                            draggable={isMovable ? true : false}
                            onDragStart={(e) => {

                                const dragData = JSON.stringify({ id: file.id, type: 'files' });
                                e.dataTransfer.setData('application/json', dragData);
                            }
                            }
                            onDragOver={(e) => e.preventDefault()}
                        >
                            {(showRenameFile && showRenameFileId === file.id) ?
                                <RenameFile fileId={file.id} setFiles={setFiles} setShowRenameFile={setShowRenameFile} />
                                :
                                <button onClick={() => handleFileClick(file.id, file.name)} style={{ textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', color: 'white' }}>{displayFile(file.name)}</button>
                            }
                            <Dropdown >
                                <Dropdown.Toggle variant="dark" id="dropdown-files" custom="true" className='no-arrow'>
                                    <BsThreeDotsVertical />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item >
                                        <DownloadFile file={file} setIsLoading={setIsLoading}
                                            setDownloadProgress={setDownloadProgress} />
                                    </Dropdown.Item>
                                    <Dropdown.Item >
                                        <DeleteFile fileId={file.id} setFiles={setFiles} />
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleClick(file.id, 'renameFile')}>
                                        Rename
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleClick(file.id, 'move')}>
                                        Move
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                        </li>
                    ))}
                    {files.length === 0 && <p>No files found</p>}
                </span>
                <span ref={spinnerRef}>
                    {showUpload && <FileUpload folderId={folderId} setIsLoading={setIsLoading} files={files} setRefresh={setRefresh} />}
                </span >
            </div>
        );
    }
};

export default FilesList;
