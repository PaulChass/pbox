import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure

const FileUpload = ({ folderId , setUpdated, linkToken, setIsRootFolder }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const token = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(false); 
  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Step 3: Set loading to true before API call
    const formData = new FormData();
    
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    formData.append( 'email', localStorage.getItem('email'));
    formData.append( 'folderId', folderId);

    
    let postUrl = `${baseUrl}/folders/${folderId}/upload`;
    if(linkToken!==undefined) {
      postUrl = `${baseUrl}/shareable-links/${linkToken}/upload`;
   }
    try {
      await api.post(postUrl, formData, {
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
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div>
    {isLoading ? ( 
      <span>Loading... Please wait</span>
    ) : (
      <form onSubmit={handleUpload}>
        <input type="file" multiple onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
    )}
  </div>
  );
};

export default FileUpload;
