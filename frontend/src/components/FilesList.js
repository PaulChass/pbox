import React, { useState, useEffect } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import FileUpload from './FileUpload';
import DownloadFile from './DownloadFile';
import DeleteFile from './DeleteFile';
import RenameFile from './RenameFile';
import { useLocation } from 'react-router-dom';
import '../styles/FileList.css';
import {  Dropdown } from 'react-bootstrap';



const FilesList = ({ folderId, isNotRootFolder, setIsLoading, updated, setUpdated,
                     showRenameFile, setShowRenameFile, isMovable , setIsMovable,
                     setDownloadProgress

                     }) => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');   
    const location = useLocation();
    
    const [showRenameFileId, setShowRenameFileId] = useState(null);
  
  
    useEffect(() => {
        fetchFiles();
    }, [folderId, location.pathname, updated]);


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
            setIsLoading(false);
            setUpdated(false);
        }
    };

    const truncateFileName = (name) => {
        if (name.length > 20) {
            return name.substring(0, 15) + '...'+ name.substring(name.length-5, name.length);
        }
        return name;
    } 
    
    return (
        <div className='section'>
            <span>
                {files.sort((a, b) => a.name.localeCompare(b.name)).map(file => (
                    <li key={file.id} style={{display:'flex',justifyContent:'center'}} 
                    draggable={isMovable? true :false }
                    onDragStart={(e) => {
                         
                        const dragData = JSON.stringify({ id: file.id, type: 'files' });
                        e.dataTransfer.setData('application/json', dragData);}
                      }                       
                    onDragOver={(e) => e.preventDefault()}
                       >
                        
                        {(showRenameFile && showRenameFileId == file.id) ?
                            <RenameFile fileId={file.id} setFiles={setFiles} setShowRenameFile={setShowRenameFile} /> 
                            : 
                            truncateFileName(file.name) 
                             }
                        <Dropdown >
                        <Dropdown.Toggle variant="dark" id="dropdown-filelist"
                         >
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item >                    
                            <DownloadFile file={file} setIsLoading={setIsLoading} 
                                    setDownloadProgress={setDownloadProgress}/>
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
                ))};
                {files.length === 0 && <p>No files found</p>}
            </span>
            {isNotRootFolder && <FileUpload folderId={folderId} setIsLoading={setIsLoading} setFiles={setFiles} files={files}/>}
        </div>
    );
};

export default FilesList;
