import React, { useState, useEffect } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import FileUpload from './FileUpload';
import DownloadFile from './DownloadFile';
import DeleteFile from './DeleteFile';
import RenameFile from './RenameFile';
import { useLocation } from 'react-router-dom';
import '../css/FileList.css';


const FilesList = ({ folderId, linkToken, isNotRootFolder }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updated, setUpdated] = useState(false);
    const token = localStorage.getItem('token');   
    const location = useLocation();
    const [isDownloading, setIsDownloading] = useState(false);

  
    useEffect(() => {
        fetchFiles();
    }, [folderId, location.pathname, updated]);


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
        <div>
            <ul>
                {files.map(file => (
                    <li key={file.id}>
                        {file.name}
                        <RenameFile fileId={file.id} setFiles={setFiles} />
                        <DownloadFile file={file.id} />
                        <DeleteFile fileId={file.id} setFiles={setFiles} />
                    </li>
                ))}
            </ul>
            <p>{linkToken}</p>
            {isNotRootFolder && <FileUpload folderId={folderId} setUpdated={setUpdated} linkToken={linkToken} />}
        </div>
    );
};

export default FilesList;
