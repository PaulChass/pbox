import React, { useState, useEffect } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import FileUpload from './FileUpload';
import DownloadFile from './DownloadFile';
import DeleteFile from './DeleteFile';
import RenameFile from './RenameFile';
import { useLocation } from 'react-router-dom';
import '../css/FileList.css';
import {  Dropdown } from 'react-bootstrap';



const FilesList = ({ folderId, linkToken, isNotRootFolder }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updated, setUpdated] = useState(false);
    const token = localStorage.getItem('token');   
    const location = useLocation();
    const [isDownloading, setIsDownloading] = useState(false);
    const [showRenameFile, setShowRenameFile] = useState(false);
    const [showRenameFileId, setShowRenameFileId] = useState(null);
  
  
    useEffect(() => {
        fetchFiles();
    }, [folderId, location.pathname, updated]);


    const handleClick = (id) => {
                setShowRenameFileId(id);
                setShowRenameFile(true);
                console.log(id);
                console.log(showRenameFileId)
        }
    

    const fetchFiles = async () => {
        try {
            let posturl = `${baseUrl}/folders/${folderId}/files`;
            if(linkToken!==undefined) {
                posturl = `${baseUrl}/shareable-links/${folderId}/files`;
             }
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
            setLoading(false);
            setUpdated(false);
        }
    };

    
    //if (loading) return <p>Loading files...</p>;
    //if (error) return <p>You need to be logged in to access your drive {linkToken}<a style={{ marginLeft: '10px', marginRight: '10px' }} href='http://localhost:3000/login'>Login</a><a href='http://localhost:3000/register'>Register</a></p>;
    return (
        <div className='section'>
            <span>
                {files.map(file => (
                    <li key={file.id} style={{display:'flex',justifyContent:'center'}}>
                        {(showRenameFile && showRenameFileId == file.id) ?
                            <RenameFile fileId={file.id} setFiles={setFiles} setShowRenameFile={setShowRenameFile} /> 
                            : file.name 
                             }
                        <Dropdown >
                        <Dropdown.Toggle variant="dark" id="dropdown-filelist">
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item >                    
                            <DownloadFile file={file} setIsLoading={setLoading}/>
                            </Dropdown.Item>
                            <Dropdown.Item >                    
                            <DeleteFile fileId={file.id} setFiles={setFiles} />
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleClick(file.id, 'renameFile')}>
                                Rename
                            </Dropdown.Item>                         
                        </Dropdown.Menu>
                    </Dropdown>
                    
                    </li>
                ))}
                {files.length === 0 && <p>No files found</p>}
            </span>
            {isNotRootFolder && <FileUpload folderId={folderId} setUpdated={setUpdated} linkToken={linkToken} />}
        </div>
    );
};

export default FilesList;
