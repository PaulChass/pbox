import React, { useState } from 'react';
import api, { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { Form, Button } from 'react-bootstrap';


const FileUpload = ({ folderId, setUpdated, linkToken, setIsRootFolder, setIsLoading }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const token = localStorage.getItem('token');
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

    formData.append('email', localStorage.getItem('email'));
    formData.append('folderId', folderId);


    let postUrl = `${baseUrl}/folders/${folderId}/upload`;
   
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

      if (linkToken !== undefined) {
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
        <div style={{marginTop:'1rem'}}>
          <Form onSubmit={handleUpload} className="file_form" style={{marginTop:'1rem'}}>
            <Form.Control type="file" multiple onChange={handleFileChange} />
            <Button type="submit">Upload</Button>
          </Form>
        </div>
    </div>
  );
};

export default FileUpload;
