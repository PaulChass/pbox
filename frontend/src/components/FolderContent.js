import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { baseUrl } from '../api.js'; // Adjust the path according to your file structure


import CreateFolder from '../components/CreateFolder';
import FileList from '../components/FilesList';
import DownloadFolder from './DownloadFolder';
import DeleteFolder from './DeleteFolder';
import RenameFolder from './RenameFolder';
import CreateShareableLink from './CreateShareableLink';
import { Container, Row, Col, Button, Card, Dropdown, Spinner, ProgressBar } from 'react-bootstrap';

import '../styles/FolderContent.css';

const FolderContent = ({ token, folderId, setFolderId, shared = false }) => {
    const [folders, setFolders] = useState([]);
    const [updated, setUpdated] = useState(false);
    const [folderName, setFolderName] = useState('root');
    const [shareFolderId, setShareFolderId] = useState(null);
    const [shareFolderName, setShareFolderName] = useState('Shared Folder');
    const [isLoading, setIsLoading] = useState(false);
    const [isAuth, setIsAuth] = useState(false);
    const [rootFolderId, setRootFolderId] = useState(null);
    const [showCreateLink, setShowCreateLink] = useState(false);
    const [showRename, setShowRename] = useState(false);
    const [showRenameId, setShowRenameId] = useState(null);
    const [showRenameFile, setShowRenameFile] = useState(false);
    const [isMovable, setIsMovable] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);



    const url = useParams().token;

    const fetchFolders = async (token) => {

        let reqparams = {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        };

        if (shared) {
            try {
                const response = await api.get(`${baseUrl}/shareable-links/${url}`, reqparams);
                setFolders(response.data.folders);
                setFolderId(response.data.folder.id);
                setFolderName(response.data.folder.name);
                setIsAuth(true);
                if (rootFolderId === null) {
                    setRootFolderId(response.data.folder.id);
                }
            } catch (error) {
                if (error) {
                    setIsAuth(false);
                    localStorage.setItem('gotoUrl', url);
                }
                console.error('Error fetching folders:', error);
            }
        } else {
            try {
                const response = await api.get(`${baseUrl}/folders/${folderId}`, reqparams);
                setFolders(response.data);
                setIsAuth(true);
            } catch (error) {
                if (error.response.status === 401) {
                    setIsAuth(false);
                }
                console.error('Error fetching folders:', error);
            }
        }
        setUpdated(false);
        setShowCreateLink(false);
        setShowRename(false);
    }

    useEffect(() => {
        fetchFolders(token);
    }, [token, updated]);


    const handleClick = (id, type = 'null') => {
        switch (type) {
            case 'createLink':
                // show create link form
                if (showCreateLink) {
                    setShowCreateLink(false);
                } else {
                    setShareFolderId(id);
                    setShareFolderName(folders.find(folder => folder.id === id).name);
                    setShowCreateLink(true);
                }
                break;

            case 'rename':
                //transform button into textarea 
                setShowRenameId(id);
                setShowRename(true);
                break;

            case 'move':
                setIsMovable(true);
                alert('You can now drag folders and files to another folder.');
                break;

            default:
                // if user isn't renaming a folder goto the folder
                if (!showRename) {
                    setFolderId(id);
                    let newFolder = folders.find(folder => folder.id === id).name;
                    setFolderName(folderName + '  >  ' + newFolder);
                }
                break;
        }
    };

    const findParentFolderId = (folders, id) => {
        const folder = folders.find(folder => folder.id === id);
        return folder ? folder.parent_id : null;
    };

    const handleBackClick = () => {
        const id = findParentFolderId(folders, folderId);
        setFolderId(id);
        if (id === null) {
            setFolderName('root');
        } else {
            let oldFolder = folderName.split(' > ').slice(0, -1).join(' > ');
            setFolderName(oldFolder);
        }
    };

    const handleDrop = (e, id) => {
        console.log(e.dataTransfer.getData('application/json'));
        console.log('Folder id:', id);
        e.preventDefault();
        const draggedData = JSON.parse(e.dataTransfer.getData('application/json'));
        const draggedId = draggedData.id;
        const type = draggedData.type;
        // if folder is dropped on itself do nothing
        if (parseInt(id) === parseInt(draggedId)) { return null };

        try {
            const response = api.patch(`${baseUrl}/${type}/${draggedId}/${id}/move`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
            );
            console.log('Folder moved:', response.data);
            setIsMovable(false)
            setUpdated(true);
        }
        catch (error) {
            console.error('Error moving folder:', error);
        }
    };

    const handleUploadFolder = async (event) => {
        event.stopPropagation();
        event.preventDefault();
        const items = event.dataTransfer.items;
        let parentId = folderId;

        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (item) {
                if (item.isFile) {
                    setIsLoading(true);

                    item.file((file) => {

                        console.log('File:', file.name);
                        const formData = new FormData();
                        formData.append('files', file);
                        formData.append('email', localStorage.getItem('email'));
                        formData.append('folderId', folderId);
                        let postUrl = `${baseUrl}/folders/${parentId}/upload`;
                        api.post(postUrl, formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'Authorization': `Bearer ${token}`
                            },
                            withCredentials: true
                        });
                    });
                } else if (item.isDirectory) {
                    setIsLoading(true);
                    traverseFileTree(item, parentId);
                }
            }
            setUpdated(true);
        }
        setIsLoading(false);
    };

    const traverseFileTree = async (item, parentId, path = '') => {
        setIsLoading(true);
        if (item.isFile) {
            item.file((file) => {
                console.log('File:', file.name);
                const formData = new FormData();
                formData.append('files', file);
                formData.append('email', localStorage.getItem('email'));
                formData.append('folderId', folderId);
                let postUrl = `${baseUrl}/folders/${parentId}/upload`;

                api.post(postUrl, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                    withCredentials: true
                });
            });
        } else if (item.isDirectory) {
            const requestData = {
                name: item.name,
                parent_id: parentId,
                email: localStorage.getItem('email')
            };
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            };
            const response = await api.post(`${baseUrl}/folders/`, requestData, config);
            console.log('Folder created:', response.data);

            parentId = response.data.id;

            const dirReader = item.createReader();
            dirReader.readEntries((entries) => {
                for (let i = 0; i < entries.length; i++) {

                    traverseFileTree(entries[i], parentId, path + item.name + '/');
                }
            });
        }

    }


    const renderFolders = () => {
        if (folders && folders.length === 0) {
            return <p>No folders found</p>;
        } else {
            return folders
            .filter(folder => folder.parent_id === folderId)
            .sort((a,b) => a.name.localeCompare(b.name))
            .map(folder => (
                <div key={folder.id} className='flexCenter' >
                    <Card className="folder droppable-card"
                        onClick={() => handleClick(folder.id)}
                        style={{ width: '18rem' }}
                        draggable={isMovable ? true : false}
                        onDragStart={(e) => {
                            if (isMovable) {
                                const dragData = JSON.stringify({ id: folder.id, type: 'folders' });
                                e.dataTransfer.setData('application/json', dragData);
                            }
                        }}
                        onDragOver={(e) => { e.preventDefault() }}
                        onDrop={(e) => { handleDrop(e, folder.id) }}
                    >

                        <Card.Body>
                            <Card.Title>
                                {showRename && showRenameId === folder.id
                                    ? <RenameFolder folderId={folder.id} setFolders={setFolders} setUpdated={setUpdated} folderName={folder.name} setShowRename={setShowRename} />
                                    : folder.name}
                            </Card.Title>
                        </Card.Body>
                    </Card>
                    <Dropdown>
                        <Dropdown.Toggle variant="dark" id="dropdown-basic" />
                        <Dropdown.Menu>
                            <Dropdown.Item>
                                <DownloadFolder folderId={folder.id} isLoading={isLoading} setIsLoading={setIsLoading} setShowRename={setShowRename} folderName={folder.name} setDownloadProgress={setDownloadProgress} />
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <DeleteFolder folderId={folder.id} setFolders={setFolders} />
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleClick(folder.id, 'createLink')}>
                                Share
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleClick(folder.id, 'rename')}>
                                Rename
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleClick(folder.id, 'move')}>
                                Move
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div >
            ));
        }
    };

    let isRoot = folderId === rootFolderId;



    if (!isAuth) {
        return (
            <div>
                <h2 className='driveTitle'>My drive</h2>
                <p style={{color:'black'}}>{shared ? <span >This is a private folder  </span> : <span>You need to Sign In to access your drive</span>}
                   <a href='/login' style={{ marginLeft: '10px', marginRight: '10px' }}>
                   <Button> Sign in</Button></a>
                   <a href='/register'> 
                   <Button>Register</Button></a>
                    </p>
            </div>
        );

    } else {
        return (
            <Container>
                <Row>
                    <Col><h2 className='driveTitle'>{shared ? 'Shared Drive' : 'My drive'} </h2></Col>
                </Row>
                <Row className="drive">

                    <div className="folders" style={{ marginTop: '1rem', marginBottom: '1rem' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleUploadFolder(e)}>
                        <h3 id='folderName'>{folderName}</h3>

                        {!isRoot &&
                            <Button variant='secondary' 
                                style={{ width: '100%', marginTop: '3rem', marginBottom: '2rem' }}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={handleBackClick} 
                                onDrop={e => handleDrop(e, findParentFolderId(folders, folderId))}>
                                ...
                            </Button>}
                        {renderFolders(folders)}

                        <CreateFolder setFolders={setFolders} folderId={folderId} />

                        {(!isRoot || shared)
                            && <FileList folderId={folderId} isNotRootFolder={!isRoot}
                                setIsLoading={setIsLoading}
                                updated={updated} setUpdated={setUpdated}
                                showRenameFile={showRenameFile} setShowRenameFile={setShowRenameFile}
                                isMovable={isMovable} setIsMovable={setIsMovable}
                                setDownloadProgress={setDownloadProgress}
                            />}

                        {showCreateLink &&
                            <CreateShareableLink folderId={shareFolderId} folderName={shareFolderName} />}

                        {
                            downloadProgress > 0 && downloadProgress < 100 &&
                            <ProgressBar now={downloadProgress} label={`${downloadProgress}%`} />
                        }
                        {isLoading &&
                            <span>Loading please wait...
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">
                                        Loading...</span>
                                </Spinner></span>}
                    </div>
                </Row>
            </Container>
        );
    }
};

export default FolderContent;
