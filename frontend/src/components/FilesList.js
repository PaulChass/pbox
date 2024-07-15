import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';

const FilesList = ({ folderId, isNotRootFolder, setIsLoading, updated, setUpdated,
    showRenameFile, setShowRenameFile, isMovable, setIsMovable,
    setDownloadProgress

}) => {
    const [files, setFiles] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');
    const location = useLocation();


    const [showRenameFileId, setShowRenameFileId] = useState(null);


    useEffect(() => {
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

    const handleFileClick = async (fileId) => {
        try {
            let getUrl = `${baseUrl}/files/${fileId}`;
    
            const response = await api.get(getUrl, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob', // Ensure Axios treats the response as a Blob
                withCredentials: true
            });
            if (response.status !== 200) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }
            // Assuming Axios or similar, the actual Blob is in response.data
            const fileBlob = response.data; // Directly use the Blob from the response
            const fileBlobUrl = window.URL.createObjectURL(fileBlob);
            window.open(fileBlobUrl, '_blank');
        } catch (error) {
            console.error('Error fetching file:', error);
        }
    };

    if (isFetching) {
        return  ( <Spinner animation="border" role="status">
        <span className="visually-hidden">
            Loading...</span>
    </Spinner>);
    } else {
        return (
            <div className='section'>
                <span>
                    {files.sort((a, b) => a.name.localeCompare(b.name)).map(file => (
                        <li key={file.id} style={{ display: 'flex', justifyContent: 'center' }}
                            draggable={isMovable ? true : false}
                            onClick={() => handleFileClick(file.id)}
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
                                <button onClick={() => handleFileClick(file.id)} style={{ textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' , color:'white'}}>{displayFile(file.name)}</button>
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
                {isNotRootFolder && <FileUpload folderId={folderId} setIsLoading={setIsLoading} files={files}  setRefresh={setRefresh} />}
            </div>
        );
    }
};

export default FilesList;
