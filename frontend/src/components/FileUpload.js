import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ folderId , setUpdated }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const token = localStorage.getItem('token');

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    formData.append( 'email', localStorage.getItem('email'));
    
    try {
      await axios.post(`http://localhost:5000/api/folders/${folderId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },                
        withCredentials: true
      });
      alert('Files uploaded successfully');
      
      setUpdated(true);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <h2>Upload File</h2>
      <input type="file"  onChange={handleFileChange} multiple />
      <button type="submit">Upload</button>
    </form>
  );
};

export default FileUpload;
