import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ folderId , setUpdated, linkToken, setIsRootFolder }) => {
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
    formData.append( 'folderId', folderId);

    
    let postUrl = 'http://localhost:5000/api/folders/'+folderId+'/upload';
    if(linkToken!==undefined) {
      postUrl = "http://localhost:5000/api/shareable-links/"+linkToken+"/upload";
   }
    try {
      await axios.post(postUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },                
        withCredentials: true
      });
      alert('Files uploaded successfully');
      setUpdated(true);

      if(linkToken!==undefined) {
      setIsRootFolder(true);
    }

    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="file"  onChange={handleFileChange} multiple />
      <button type="submit">Upload</button>
    </form>
  );
};

export default FileUpload;
