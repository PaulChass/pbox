import React, { useEffect, useState } from 'react';
import api, { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import CreateFolder from '../components/CreateFolder';
import FileList from '../components/FilesList';
import { useLocation } from 'react-router-dom';
import DownloadFolder from './DownloadFolder';
import DeleteFolder from './DeleteFolder';
import RenameFolder from './RenameFolder';
import CreateShareableLink from './CreateShareableLink';
import { Container, Row, Col, Button, Card, Dropdown, Spinner } from 'react-bootstrap';

const FolderContent = ({ token, folderId, setFolderId, shared = false }) => {
    const [folders, setFolders] = useState([]);
    const [updated, setUpdated] = useState(false);

    const [folderName, setFolderName] = useState('My drive');
    const [shareFolderId, setShareFolderId] = useState(null);
    const [shareFolderName, setShareFolderName] = useState('S');
    const [isLoading, setIsLoading] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [rootFolderId, setRootFolderId] = useState(null);
    const [showCreateLink, setShowCreateLink] = useState(false);
    const [showRename, setShowRename] = useState(false);
    const [showRenameId, setShowRenameId] = useState(null);

   
    console.log(localStorage.getItem('token'));


    const fetchFolders = async (token) => {

        let reqparams = {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            withCredentials: true
        };


        if (shared) {
            let shareableLink = localStorage.getItem('tokenUrl');
            try {
                const response = await api.get(`${baseUrl}/shareable-links/${shareableLink}`, reqparams);
                setFolders(response.data.folders);
                setFolderId(response.data.folder.id);
                setFolderName(response.data.folder.name);
                if (rootFolderId === null) {
                    setRootFolderId(response.data.folder.id);
                }
                if (response.data.type ==='public')
                    {
                        setLoggedIn(true);
                    }
            } catch (error) {
                console.error('Error fetching folders:', error);
            }
        } else {
            try {
                const response = await api.get(`${baseUrl}/folders/${folderId}`, reqparams);
                setFolders(response.data);
                setLoggedIn(true);
            } catch (error) {
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
                if (showCreateLink) {
                    setShowCreateLink(false);
                } else {
                    setShareFolderId(id);
                    setShareFolderName(folders.find(folder => folder.id === id).name);
                    setShowCreateLink(true);
                }
                break;

            case 'rename':
                setShowRenameId(id);
                setShowRename(true);
                break;

            default:
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
            setFolderName('My drive');
        } else {
            let oldFolder = folderName.split(' > ').slice(0, -1).join(' > ');
            setFolderName(oldFolder);
        }
    };

    const renderFolders = () => {
        if (folders && folders.length === 0) {
            return <p>No folders found</p>;
        } else {
            return folders.filter(folder => folder.parent_id === folderId).map(folder => (
                <div key={folder.id} className='flexCenter'>
                    <Card className="folder" onClick={() => handleClick(folder.id)} style={{ width: '18rem' }}>
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
                                <DownloadFolder folderId={folder.id} isLoading={isLoading} setIsLoading={setIsLoading} setShowRename={setShowRename} />
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
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            ));
        }
    };

    let isRoot = folderId === rootFolderId;
    console.log('email', localStorage.getItem('email'));
    console.log('loggedIn', loggedIn);
    

    if (!loggedIn) {
        return (
            <div>
                <h2 className='driveTitle'>My drive</h2>
                <p>{shared ? <span>This is a private folder  </span> : <span>You need to Sign In to access your drive</span> }
                    <a href='/login' style={{ marginLeft: '10px', marginRight: '10px' }}>Sign in</a>
                    <a href='/register'>Register</a></p>
            </div>
        );
    
    } else {
        return (
            <Container>
                <Row>
                    <Col><h2 className='driveTitle'>{shared? 'Shared Drive' : 'Welcome to your drive'} </h2></Col>
                </Row>
                <Row className="folders">
                    <h3 id='folderName'>{folderName}</h3>

                    <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        {!isRoot && 
                            <Button variant='secondary' style={{ width: '100%', marginTop: '3rem', marginBottom: '2rem' }} 
                                onClick={handleBackClick}> ...
                            </Button>}
                        {renderFolders(folders)}
                        <CreateFolder setFolders={setFolders} folderId={folderId} />
                    </div>

                    <FileList folderId={folderId} isNotRootFolder={folderId !== null} />

                    {showCreateLink && <CreateShareableLink folderId={shareFolderId} folderName={shareFolderName} />}

                    {isLoading &&
                        <span>Loading please wait...<Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner></span>}
                        
                </Row>
            </Container>
        );
    }
};

export default FolderContent;
