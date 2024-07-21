import React, { useState, useEffect, useRef } from 'react';
import api, { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import FileUpload from './FileUpload';

import { useLocation } from 'react-router-dom';
import '../styles/FileList.css';

import LoadingSpinner from './LoadingSpinner.js';
import VideoPLayer from './VideoPlayer.js';
import FileItem from './FileItem.js';

const FilesList = ({ folderId, showUpload, setIsLoading, updated, setUpdated,
     isMovable, setIsMovable,
    setDownloadProgress,
}) => {
    const [files, setFiles] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [updateFileList, setUpdateFileList] = useState(false);
    const [showVideoPlayer, setShowVideoPlayer] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
    const token = localStorage.getItem('token');
    const location = useLocation();
    const spinnerRef = useRef(null);
    const frameRef = useRef(null);

    useEffect(() => {
        setShowVideoPlayer(false);
        setCurrentVideoUrl(null);
        setIsFetching(true);
        fetchFiles();
    }, [folderId, location.pathname, updated, updateFileList]);

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
            console.error('Error fetching files:', err);
        } finally {
            setIsFetching(false);
            setUpdated(false);
            setUpdateFileList(false);
        }
    };

    return isFetching ? <LoadingSpinner /> : (
        <div className='section' ref={frameRef}>
            <div className='frame' ></div>
            {showVideoPlayer && (
                <VideoPLayer currentVideoUrl={currentVideoUrl}/>)}
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
                        <FileItem
                            file={file}                           
                            setFiles={setFiles}
                            setIsLoading={setIsLoading}
                            setDownloadProgress={setDownloadProgress}
                            setIsMovable={setIsMovable}
                        />
                    </li>
                ))}
                {files.length === 0 && 
                    <p>No files found</p>}
            </span>
            <span ref={spinnerRef}>
                {showUpload && 
                    <FileUpload folderId={folderId} setIsLoading={setIsLoading} files={files} setUpdateFileList={setUpdateFileList} />}
            </span >
        </div>
    );
};

export default FilesList;
