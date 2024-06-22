import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import FileList from '../components/FilesList';
import FileUpload from '../components/FileUpload';
import FilesList from '../components/FilesList';


const ShareableLinkPage = ({ }) => {
  const { token } = useParams();
  const [thisFolder, setThisFolder] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [type, setType] = useState('');
  const [updated ,setUpdated] = useState(false);
  const [isRootFolder ,setIsRootFolder] = useState(true);

  useEffect(() => {
    fetchFolder();
  }, [token, updated]);



  const fetchFolder = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/shareable-links/${token}`);
      setType(response.data.type);
      setThisFolder(response.data.folder);
      setFolders(response.data.folders);
      setFiles(response.data.files);
      setUpdated(false)    

    } catch (error) {
      console.error('Failed to fetch folders:', error);
      // Handle error (e.g., show error message)
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
      if(newFolder) {setThisFolder(newFolder)}
      else{
        setUpdated(true);
        setIsRootFolder(true);
      };
    ;}



  return (
    <div>
      <h2>Shared Folder</h2>
      { !isRootFolder && <button onClick={() => handleBackClick()}>...</button>}
      <ul>{renderFolders(folders)}</ul>
      <ul>{renderFiles(files)}</ul>

      <ul key={thisFolder.name}>{thisFolder.name}-id:{thisFolder.id}</ul>
    </div>
  );
};



export default ShareableLinkPage;
