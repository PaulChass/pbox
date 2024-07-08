import React, { useState } from 'react';
import { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { Form, Button, ProgressBar } from 'react-bootstrap';


const FileUpload = ({ folderId, setFiles, files, setIsLoading }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const token = localStorage.getItem('token');
  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData();

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
      }
    }, false);

    xhr.addEventListener('readystatechange', function (e) {
      if (xhr.readyState == 4 && xhr.status == 200) {
        // Upload complete
        console.log('Upload complete.');
      } else if (xhr.readyState == 4 && xhr.status != 200) {
        // Error handling
        console.log('Upload failed.');
      }
    });

    xhr.open('POST', postUrl, true);
    xhr.send(formData); xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        setUploadProgress(progress); // Update state with the progress
      }
    };

    xhr.onload = function () {
      if (xhr.status === 200) {
        alert('Files uploaded successfully');
        setFiles([...files, ...selectedFiles]);
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
    };

    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.withCredentials = true;

    xhr.send(formData);
  };

  return (
    <div>
      <div style={{ marginTop: '1rem' }}>
        <Form onSubmit={handleUpload} className="file_form" style={{ marginTop: '1rem' }}>
          <Form.Control type="file" multiple onChange={handleFileChange} />
          <Button type="submit">Upload</Button>
        </Form>
      </div>
      {
        uploadProgress > 0 && uploadProgress < 100 &&
        <ProgressBar now={uploadProgress} label={`${uploadProgress.toFixed(2)}%`} />
      }
    </div>
  );
};

export default FileUpload;
