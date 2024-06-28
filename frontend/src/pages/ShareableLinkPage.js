import React, { useEffect, useState } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { useParams } from 'react-router-dom';
import DownloadFolder from '../components/DownloadFolder';
import FileUpload from '../components/FileUpload';
import FolderTree from '../components/FolderTree';
import CreateFolder from '../components/CreateFolder';



const ShareableLinkPage = ({ }) => {
  const { token } = useParams();
  const [thisFolder, setThisFolder] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [type, setType] = useState('');
  const [updated, setUpdated] = useState(false);
  const [isRootFolder, setIsRootFolder] = useState(true);


  localStorage.setItem('tokenUrl', token);
  const authToken = localStorage.getItem('token');

  useEffect(() => {
    fetchFolder();
  }, [token, updated]);

  const fetchFolder = async () => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        withCredentials: true
      };
      const response = await api.get(`${baseUrl}/shareable-links/${token}`, config);
      setType(response.data.type);
      setThisFolder(response.data.folder);
      setFolders(response.data.folders);
      setFiles(response.data.files);
      setUpdated(false)

    } catch (error) {
      console.error('Failed to fetch folders:', error);
    }
  };

  const renderFolders = (folders) => {
    return folders
      .filter(folder => folder.parent_id === thisFolder.id)
      .map(folder => (
        <li key={folder.id}>
          <button onClick={() => handleClick(folder.id)} >{folder.name}
          </button>
        </li>
      ));
  };

  const renderFiles = (files) => {
    return files
      .filter(file => file.folder_id === thisFolder.id)
      .map(file => (
        <li key={file.id}>{file.name}</li>
      ));
  };

  const handleClick = (id) => {
    let newFolder = folders.find(folder => folder.id === id);
    setThisFolder(newFolder);
    setIsRootFolder(false);
  };

  const handleBackClick = () => {
    let newFolder = folders.find(folder => folder.id === thisFolder.parent_id);
    if (newFolder) { setThisFolder(newFolder) }
    else {
      setUpdated(true);
      setIsRootFolder(true);
    };
    ;
  }
  console.log(localStorage);  
  let empty = thisFolder.length == 0;
  return (
    <div>
      <h2>Shared Folder</h2>
      {empty &&
        <h3>This folder is private you need to log in to access its content
          <a style={{ marginLeft: '20px' }} href="/login">Sign in</a>
          <a style={{ marginLeft: '20px' }} href="/Register">Sign up</a></h3>}
      <h3>{thisFolder.name}</h3>
      {!isRootFolder && <button onClick={() => handleBackClick()}>...</button>}
      <ul>{renderFolders(folders)}</ul>
      {!empty && <CreateFolder setFolders={setFolders} folderId={thisFolder.id} />}
      <ul>{renderFiles(files)}</ul>
      {!empty && <FileUpload folderId={thisFolder.id} linkToken={token} setUpdated={setUpdated} setIsRootFolder={setIsRootFolder} />}
      {!empty && <DownloadFolder folderId={thisFolder.id} />}
     
        <FolderTree />
      


    </div>
  );
};



export default ShareableLinkPage;
