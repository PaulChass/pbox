import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api, { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { BsFolder2Open, BsThreeDotsVertical, BsArrowReturnLeft  } from 'react-icons/bs';

import CreateFolder from '../components/CreateFolder';
import FileList from '../components/FilesList';
import DownloadFolder from './DownloadFolder';
import DeleteFolder from './DeleteFolder';
import RenameFolder from './RenameFolder';
import CreateShareableLink from './CreateShareableLink';
import { Container, Row, Col, Button, Card, Dropdown, Spinner, ProgressBar } from 'react-bootstrap';

import '../styles/FolderContent.css';

const FolderContent = ({ token, folderId, setFolderId, shared  }) => {
    const [folders, setFolders] = useState([]);
    const [updated, setUpdated] = useState(false);
    const [folderName, setFolderName] = useState('My drive');
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
    const [numberOfFiles, setNumberOfFiles] = useState(0);
    const [fileNumber, setFileNumber] = useState(0);
    const spinnerRef = useRef(null);
    const shareFolderRef = useRef(null);

    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        // Example check: window width more than 1024px is considered desktop
        const checkIfDesktop = () => {
            setIsDesktop(window.innerWidth > 1024);
        };

        // Run once on mount
        checkIfDesktop();

        // Optional: Adjust on window resize
        window.addEventListener('resize', checkIfDesktop);
        return () => window.removeEventListener('resize', checkIfDesktop);
    }, []);

    const url = useParams().token;

    useEffect(() => {
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
            
    
        };
        const fetchAndSetFolders = async () => {
            await fetchFolders(token);
        };
        fetchAndSetFolders();
    }, [ token, updated]);


    useEffect(() => {
        if (isLoading) {
            spinnerRef.current?.scrollIntoView({ behavior: 'smooth' }); // Scroll to the spinner
        }
    }, [isLoading]);


    const goToFolder = (name) => {
        if (name === 'My drive') {
            setFolderId(rootFolderId);
            setFolderName('My drive');
            return;
        }
        let newfolder = folders.find(folder => folder.name === name);
        if (!newfolder) {
            name = name.trim();
            newfolder = folders.find(folder => folder.name === name);
        }
        // goto folder
        handleClick(newfolder.id);
    }

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
                    shareFolderRef.current?.scrollIntoView({ behavior: 'smooth' }); // Scroll to the spinner
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
                // if user isn't renaming a folder go to the folder
                if (!showRename) {
                    setFolderId(id);
                    let newFolder = folders.find(folder => folder.id === id).name;
                    if(folderName.includes(newFolder)){
                        let splits = folderName.split(' > ');
                        let index = splits.indexOf(newFolder);
                        setFolderName(splits.slice(0, index + 1).join(' > '));
                    } else {
                        setFolderName(folderName + ' > ' + newFolder);}
                    
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
            setFolderName('My drive');
        } else {
            let oldFolder = folderName.split(' > ').slice(0, -1).join(' > ');
            setFolderName(oldFolder);
        }
    };

    const handleDrop = (e, id) => {
        e.preventDefault();
        const draggedData = JSON.parse(e.dataTransfer.getData('application/json'));
        const draggedId = draggedData.id;
        const type = draggedData.type;
        if (parseInt(id) === parseInt(draggedId)) { return null };
        try {
            const response = api.patch(`${baseUrl}/${type}/${draggedId}/${id}/move`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
            );
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

            parentId = response.data.id;

            const dirReader = item.createReader();
            dirReader.readEntries((entries) => {
                setNumberOfFiles(entries.length);
                setFileNumber(0);
                for (let i = 0; i < entries.length; i++) {
                    setFileNumber(fileNumber + 1);
                    traverseFileTree(entries[i], parentId, path + item.name + '/');
                }
                setFileNumber(0);
                setNumberOfFiles(0);
                setIsLoading(false);
            });
            setNumberOfFiles(0);
            setIsLoading(false);
        }
    }

    let isRoot = folderId === rootFolderId;

    const renderFolders = (folders) => {
    if (folders.length === 0 && isAuth) {
        if (isRoot) {
            return isDesktop ? <p className='mt-1 mb-4'>Welcome to your drive. Create a folder or drag a folder to get started</p>
             : <p className='mt-1 pb-3'> Welcome to your drive . Create a folder or drag a folder here</p>
        } else {
            return <p></p>;
        }
    } else {
        return folders
            .filter(folder => folder.parent_id === folderId)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(folder => (
                <div key={folder.id} className='flexCenter' >
                    <Card className="folder droppable-card"
                        onClick={() => handleClick(folder.id)}
                        style={{ width: '12rem', height: '3rem' }}
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
                            <Card.Title className='cardTitle'>
                                {showRename && showRenameId === folder.id
                                    ? <RenameFolder folderId={folder.id} setFolders={setFolders} setUpdated={setUpdated} folderName={folder.name} setShowRename={setShowRename} />
                                    :
                                    <span><BsFolder2Open></BsFolder2Open> {folder.name}</span>}
                            </Card.Title>
                        </Card.Body>
                    </Card>
                    <Dropdown>
                        <Dropdown.Toggle variant="dark" id="dropdown-basic" custom="true" className='no-arrow'>
                            <BsThreeDotsVertical />
                        </Dropdown.Toggle>                        <Dropdown.Menu>
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

    

    if(!isAuth) {
        return (
            <div>
                <h2 className='driveTitle'>My drive</h2>
                <p style={{ color: 'black' }}>
                    <span>You need to Sign In to access this drive</span>
                    <a href= {shared ? `/shareable-link/${url}/login` :`/login`} style={{ marginLeft: '10px', marginRight: '10px' }}>
                        <Button> Sign in</Button></a>
                        <a href= {shared ? `/shareable-link/${url}/register` :`/register`} style={{ marginLeft: '10px', marginRight: '10px' }}>
                        <Button>Register</Button></a>
                </p>
            </div> 
            )
        
    }
    else {
        return (
            <Container>
                <Row>
                    <Col><h2 className='driveTitle'>{shared ? 'Shared Drive' : 'My drive'} </h2></Col>
                </Row>
                <Row className="drive">
                    <div className="folders" style={{ marginTop: '1rem', marginBottom: '1rem' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleUploadFolder(e)}>

                        <h3 id='folderName'>
                        {folderName.split('>').map((name, index) => ( <span>
                        <Button className="btn btn-link" 
                            style={{color:'white'}}
                            key={index}
                            onClick={()=> {goToFolder(name)} }>
                            {name}
                        </Button>
                        { index !== folderName.split('>').length - 1 && '>'}
                        </span>
                        ))}
                        </h3>
                        
                    {!isRoot &&
                            <Button variant='secondary'
                                style={{ width: '100%', marginTop: '2rem', marginBottom: '1rem' }}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={handleBackClick}
                                onDrop={e => handleDrop(e, findParentFolderId(folders, folderId))}>
                                <BsArrowReturnLeft />
                            </Button>}

                        {renderFolders(folders)}

                        <CreateFolder setFolders={setFolders} folderId={folderId} />

                        {(!isRoot || shared)
                            &&
                            <div>
                                <FileList folderId={folderId} showUpload={!isRoot || shared}
                                    setIsLoading={setIsLoading}
                                    setDownloadProgress={setDownloadProgress}
                                    updated={updated} setUpdated={setUpdated}
                                    showRenameFile={showRenameFile} setShowRenameFile={setShowRenameFile}
                                    isMovable={isMovable} setIsMovable={setIsMovable}
                                />
                            </div>
                        }
                        <div ref={shareFolderRef}></div>
                        {showCreateLink &&
                            <CreateShareableLink folderId={shareFolderId} folderName={shareFolderName} />}

                        {
                            downloadProgress > 0 && isLoading &&
                            <ProgressBar now={downloadProgress} label={`${downloadProgress}%`} />
                        }
                        <span ref={spinnerRef}>
                            {isLoading &&
                                <span style={{ marginTop: '1rem' }}>Loading please wait...
                                    <Spinner animation="border" role="status" >
                                        <span className="visually-hidden">
                                            Loading...</span>
                                    </Spinner></span>}
                            {fileNumber > 0 && numberOfFiles > 0 &&
                                <ProgressBar now={fileNumber / numberOfFiles * 100} label={`${fileNumber} of ${numberOfFiles}`} />
                            }
                        </span>
                    </div>
                </Row>
            </Container>
        );
    }
}

export default FolderContent;
