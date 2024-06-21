import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './FileUpload';
import { useLocation } from 'react-router-dom';


const FilesList = ({ folderId }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updated, setUpdated] = useState(false);
    const token = localStorage.getItem('token');
    const location = useLocation();


    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/folders/${folderId}/files`,{
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

        fetchFiles();
    }, [folderId,updated, location.pathname]);

    if (loading) return <p>Loading files...</p>;
    if (error) return <p>Error loading files: {error.message}</p>;

    return (
        <div>
            <FileUpload folderId={folderId} setUpdated={setUpdated}/>
            <h2>Files in Folder {folderId}</h2>
            <ul>
                {files.map(file => (
                    <li key={file.id}>{file.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default FilesList;
