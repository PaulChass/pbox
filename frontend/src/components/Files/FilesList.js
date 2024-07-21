import React, { useState, useEffect, useRef } from 'react';
import api, { baseUrl } from '../../api';
import { useLocation } from 'react-router-dom';
import FileUpload from './FileUpload';
import LoadingSpinner from '../LoadingSpinner';
import VideoPlayer from './VideoPlayer'; 
import FileItem from './FileItem';
import '../../styles/FileList.css';


/**
 * FilesList component displays a list of files within a specified folder.
 * It supports file upload, file drag-and-drop, and displays a video player for video files.
 * 
 * @param {Object} props
 * @param {number} props.folderId - The id of the folder to display files from
 * @param {boolean} props.showUpload - Whether to display the file upload component
 * @param {function} props.setIsLoading - Function to set the loading state of the parent component
 * @param {boolean} props.updated - Whether the files have been updated
 * @param {function} props.setUpdated - Function to set the updated state of the parent component
 * @param {boolean} props.isMovable - Whether the files and folders are movable
 * @param {function} props.setIsMovable - Function to set the movable state of the parent component
 * @param {function} props.setDownloadProgress - Function to set the download progress
 * 
 * 
 * @returns {JSX.Element} - FilesList component
 * 
 * @example
 * return (
 *  <FilesList folderId={folderId} showUpload={true} setIsLoading={setIsLoading} updated={updated} setUpdated={setUpdated} isMovable={true} setIsMovable={setIsMovable} setDownloadProgress={setDownloadProgress} />
 * );
 *    
 */
const FilesList = ({
    folderId,
    showUpload,
    setIsLoading,
    setUpdated,
    setDownloadProgress,
    
}) => {
    const [files, setFiles] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [updatedFileList, setUpdatedFileList] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
    const [frameTitle, setFrameTitle] = useState(null);
    const [isMovable, setIsMovable] = useState(false);

    const token = localStorage.getItem('token');
    const location = useLocation();
    const frameRef = useRef(null);  
    useEffect(() => {
        setCurrentVideoUrl(null);
        setIsFetching(true);
        fetchFiles();
        setFrameTitle(null);
    }, [folderId, location.pathname, updatedFileList]);

    
    const fetchFiles = async () => {
        try {
            //if url contains shareable, get files from shared folder
            if (location.pathname.includes('shareable')) {
                // get token from url
                let shareableUrl = location.pathname.split('/')[2];
                let posturl = `${baseUrl}/shareable-links/${shareableUrl}`;
                const response = await api.get(posturl, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`,
                    },
                    withCredentials: true,
                });
                setFiles(response.data.files);
            }
            let posturl = 
            `${baseUrl}/folders/${folderId}/files`;
                const response = await api.get(posturl, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`,
                },
                withCredentials: true,
            });
            setFiles(response.data.data);
        } catch (err) {
            console.error('Error fetching files:', err);
        } finally {
            setIsFetching(false);
            setUpdated(false);
            setUpdatedFileList(false);
        }
    };

    return isFetching ? (
        <LoadingSpinner />
    ) : (
        <div className='section'>
            {frameTitle && <h3 id='frameTitle' >{frameTitle}</h3> }
            <div className='frame' ref={frameRef}></div>
            {currentVideoUrl && <VideoPlayer currentVideoUrl={currentVideoUrl} setIsLoading={setIsLoading} />}
            {files.length === 0 && <p>No files found</p>}
            <ul className='resetStyles'>
                {files.sort((a, b) => a.name.localeCompare(b.name)).map((file) => (
                        <FileItem
                            file={file}
                            setFiles={setFiles}
                            setIsLoading={setIsLoading}
                            setDownloadProgress={setDownloadProgress}
                            currentVideoUrl={currentVideoUrl}
                            setCurrentVideoUrl={setCurrentVideoUrl}
                            setIsMovable={setIsMovable}
                            setUpdatedFileList={setUpdatedFileList}
                            setFrameTitle={setFrameTitle}
                            frameRef={frameRef}
                            key={file.id} className="file-item" isMovable={isMovable}
                        />
                ))}
            </ul>
            <div>
                {showUpload && (
                    <FileUpload
                        folderId={folderId}
                        setIsLoading={setIsLoading}
                        setUpdatedFileList={setUpdatedFileList}
                    />
                )}
            </div>
        </div>
    );
};

export default FilesList;