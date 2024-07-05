import React, { useState, useEffect } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import FileUpload from './FileUpload';
import DownloadFile from './DownloadFile';
import DeleteFile from './DeleteFile';
import RenameFile from './RenameFile';
import { useLocation } from 'react-router-dom';
import '../styles/FileList.css';
import {  Dropdown } from 'react-bootstrap';



const FilesList = ({ folderId, linkToken, isNotRootFolder, setIsLoading, updated, setUpdated, showRenameFile, setShowRenameFile }) => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');   
    const location = useLocation();
    
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
            setIsLoading(false);
            setUpdated(false);
        }
    };

 
    
    return (
        <div className='section'>
            <span>
                {files.map(file => (
                    <li key={file.id} style={{display:'flex',justifyContent:'center'}} 
                       >
                        
                        {(showRenameFile && showRenameFileId == file.id) ?
                            <RenameFile fileId={file.id} setFiles={setFiles} setShowRenameFile={setShowRenameFile} /> 
                            : file.name 
                             }
                        <Dropdown >
                        <Dropdown.Toggle variant="dark" id="dropdown-filelist"
                         draggable={showRenameFile? false :true }
                         onDragStart={(e) => {
                             if(!showRenameFile){ 
                             const dragData = JSON.stringify({ id: file.id, type: 'files' });
                             e.dataTransfer.setData('application/json', dragData);}
                           }}                        
                         onDragOver={(e) => e.preventDefault()}>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item >                    
                            <DownloadFile file={file} setIsLoading={setIsLoading}/>
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
            {isNotRootFolder && <FileUpload folderId={folderId} setUpdated={setUpdated} linkToken={linkToken} setIsLoading={setIsLoading}/>}
        </div>
    );
};

export default FilesList;
