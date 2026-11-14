import React, { useEffect, useRef, useState } from 'react';
import { tusUpload, notifyStorageChanged } from '../../tusUpload.js';
import { Form, Button, ProgressBar } from 'react-bootstrap';
import { BsXCircle } from 'react-icons/bs';

const FileUpload = ({ folderId, setIsLoading, setUpdatedFileList }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const currentUpload = useRef(null);

  // Warn before closing the tab mid-upload (it can be resumed, but still).
  useEffect(() => {
    if (!isUploading) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isUploading]);

  // Stop the running upload if the component goes away.
  useEffect(() => () => { currentUpload.current?.abort(); }, []);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select a file to upload');
      return;
    }

    const files = Array.from(selectedFiles);
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0) || 1;
    let doneBytes = 0;
    let uploadedCount = 0;
    const errors = [];

    setIsLoading(true);
    setIsUploading(true);
    setUploadProgress(0.01);

    // One file at a time: a failing file no longer sinks the whole batch.
    for (const [i, file] of files.entries()) {
      setStatus(`Uploading ${file.name} (${i + 1}/${files.length})`);
      const bytesBefore = doneBytes;
      try {
        await tusUpload(file, folderId, {
          uploadRef: currentUpload,
          onProgress: (bytes) => {
            setUploadProgress(Math.max(0.01, ((bytesBefore + bytes) / totalBytes) * 100));
          },
        });
        uploadedCount += 1;
      } catch (err) {
        console.error(err);
        errors.push(err.message);
      }
      doneBytes += file.size;
    }

    currentUpload.current = null;
    setIsUploading(false);
    setIsLoading(false);
    setUploadProgress(0);
    setStatus('');
    setSelectedFiles(null);

    if (uploadedCount > 0) {
      setUpdatedFileList(true);
      notifyStorageChanged();
    }
    if (errors.length === 0) {
      alert(files.length > 1 ? 'Files uploaded successfully' : 'File uploaded successfully');
    } else {
      alert(`${uploadedCount}/${files.length} uploaded.\n\n${errors.join('\n')}\n\nTry again to resume failed uploads.`);
    }
  };

  return (
    <div>
      <div style={{ marginTop: '1rem' }}>
        {
          showForm ? <div>
            <Form onSubmit={handleUpload} className="file_form" style={{ marginTop: '1rem' }}>
              <Form.Control type="file" multiple onChange={handleFileChange} disabled={isUploading} />
              <Button type="submit" disabled={isUploading}>Upload</Button>
            </Form>
            {!isUploading && <BsXCircle style={{ margin: '0.5rem' }} onClick={() => { setShowForm(false) }} />}
          </div> :
            <span style={{ textDecoration: 'underline', marginBottom: '2rem' }} onClick={() => { setShowForm(prevState => !prevState) }}>Upload files</span>
        }
      </div>
      {
        uploadProgress > 0 && uploadProgress < 100 &&
        <div>
          {status && <small>{status}</small>}
          <ProgressBar now={uploadProgress} label={`${uploadProgress.toFixed(1)}%`} />
        </div>
      }
    </div>
  );
};

export default FileUpload;
