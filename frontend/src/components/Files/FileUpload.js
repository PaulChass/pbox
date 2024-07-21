import React, { useState } from 'react';
import { baseUrl } from '../../api.js'; // Adjust the path according to your file structure
import { Form, Button, ProgressBar } from 'react-bootstrap';
import { BsXCircle } from 'react-icons/bs';

const FileUpload = ({ folderId, setIsLoading, setUpdatedFileList }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    if (!selectedFiles) {
      alert('Please select a file to upload');
      setIsLoading(false);
      return;
    }
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    formData.append('email', localStorage.getItem('email'));
    formData.append('folderId', folderId);


    let postUrl = `${baseUrl}/folders/${folderId}/upload`;

    // Client-side example using XMLHttpRequest for file upload and progress tracking
    var xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', function (e) {
      if (e.lengthComputable) {
        var percentComplete = (e.loaded / e.total) * 100;
        console.log(percentComplete + '% uploaded');
        setUploadProgress(percentComplete);
      }
    }, false);

    xhr.addEventListener('readystatechange', function (e) {
      if (xhr.readyState === 4 && xhr.status === 200) {
        console.log('Upload complete.');
        setIsLoading(false);
        setUploadProgress(0);
      } else if (xhr.readyState === 4 && xhr.status !== 200) {
        // Error handling
        console.log('Upload failed.');
      }
    });

    

    xhr.onload = function () {
      if (xhr.status === 200) {
        alert('Files uploaded successfully');
        setUpdatedFileList(true);
      } else {
        console.error('Error uploading files:', xhr.statusText);
        alert('Error uploading files');
      }
      setIsLoading(false);
      setUploadProgress(0);
      setSelectedFiles(null);
    };

    xhr.onerror = function () {
      console.error('Error uploading files:', xhr.statusText);
      alert('Error uploading files');
      setIsLoading(false);
      setUploadProgress(0);
    };
    xhr.open('POST', postUrl, true);
   // xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.withCredentials = true;

    xhr.send(formData);
  };

  return (
    <div>
      <div style={{ marginTop: '1rem' }}>
        {
          showForm ? <div>
        <Form onSubmit={handleUpload} className="file_form" style={{ marginTop: '1rem' }}>
          <Form.Control type="file" multiple onChange={handleFileChange} />
          <Button type="submit">Upload</Button>
        </Form>
          <BsXCircle style={{margin:'0.5rem'}} onClick={()=>{setShowForm(false)}}/>
        </div>                   :
        <span style={{textDecoration: 'underline', marginBottom:'2rem'}} onClick={() => {setShowForm(prevState => !prevState)}}>Upload files</span>
        }
      </div>
      {
        uploadProgress > 0 && uploadProgress < 100 &&
        <ProgressBar now={uploadProgress} label={`${uploadProgress.toFixed(2)}%`} />
      }
    </div>
  );
};

export default FileUpload;
