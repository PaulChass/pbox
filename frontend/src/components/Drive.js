import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api, { baseUrl } from '../api.js'; 
import { findParentFolderId, traverseFileTree } from './Folders/FolderUtilities.js';
import CreateFolder from './Folders/CreateFolder.js';
import FilesList from './Files/FilesList.js';
import CreateShareableLink from './CreateShareableLink.js';
import { Container, Row, Button, ProgressBar } from 'react-bootstrap';
import FoldersList from './Folders/FoldersList.js';
import AuthMessage from './AuthMessage.js';
import LoadingSpinner from './LoadingSpinner.js';
import useIsDesktop from './useIsDesktop'; 
import DriveTitle from './DriveTitle.js'; 
import BackButton from './BackButton.js';
import '../styles/FolderContent.css';

/**
 * Drive component displays the contents of a drive.
 * 
 * @param {Object} props
 * @param {string} props.token - The user's authentication token
 * @param {number} props.folderId - The id of the folder to display
 * @param {function} props.setFolderId - Function to set the folder id
 * @param {boolean} props.shared - Whether the folder is shared 
 *      
 * 
 * @returns {JSX.Element} - Drive component
 * 
 * @example
 * return (
 * <Drive token={token} folderId={folderId} setFolderId={setFolderId} shared={shared} />
 * );
 * 
 */
const Drive = ({ token, folderId, setFolderId, shared }) => {

    const [folders, setFolders] = useState([]);
    const [updated, setUpdated] = useState(false);
    const [folderName, setFolderName] = useState('My drive');
    const [shareFolderId, setShareFolderId] = useState(null);
    const [shareFolderName, setShareFolderName] = useState('Shared Folder');
    const [isLoading, setIsLoading] = useState(false);
    const [lazyLoading, setLazyLoading] = useState(false);
    const [isAuth, setIsAuth] = useState(false);
    const [rootFolderId, setRootFolderId] = useState(null);
    const [shareableLink, setShareableLink] = useState(null);
    const [showRenameFile, setShowRenameFile] = useState(false);
    const [isMovable, setIsMovable] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const spinnerRef = useRef(null);
    const shareFolderRef = useRef(null);
    let isRoot = folderId === rootFolderId; // Check if user is in root folder

    const url = useParams().token;
    const email = localStorage.getItem('email');

    const isDesktop = useIsDesktop();


    /**
     * Fetches folders from the specified URL.
     * 
     * @param {string} url - The URL to fetch folders from.
     * @param {object} reqparams - The request parameters.
     * @param {boolean} isShared - Indicates whether the folders are shared.
     * @returns {Promise<void>} - A promise that resolves when the folders are fetched.
     * @throws {Error} - If an error occurs while fetching the folders.
     */
    async function fetchFolders(url, reqparams, isShared) {
        try {
            const response = await api.get(url, reqparams);
            if (isShared ) {
                setFolders(response.data.folders);
                if(folders.length === 0) {
                setFolderId(response.data.folder.id);
                setFolderName(response.data.folder.name);
            }
            } else {
                setFolders(response.data.data);
            }
            setIsAuth(true);
            if (isShared && rootFolderId === null) {
                setRootFolderId(response.data.folder.id);
            }
        } catch (error) {
            setIsAuth(false);
            console.error('Error fetching folders:', error);
        }   finally {
            setLazyLoading(false);
        }
    }
    console.log(token);
    // Fetch folders when updated state changes
    useEffect(() => {
        const fetchAndSetFolders = async () => {
            let reqparams = {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            };
            if (shared) {
                fetchFolders(`${baseUrl}/shareable-links/${url}`, reqparams, true);
            } else {
                fetchFolders(`${baseUrl}/folders/${folderId}`, reqparams, false);
            }        
        };
        if (updated) { // Fetch folders when updated state changes
            fetchAndSetFolders();
            setUpdated(false);
        }
    }, [folderId, token, shared, url, updated, rootFolderId, email, setFolders, setFolderId, setFolderName]);


    // Set updated to true when token changes
    useEffect(() => {
        setUpdated(true);
    }, [token, folderId]);

    // Scroll to spinner when loading
    useEffect(() => {
        if (isLoading) {
            spinnerRef.current?.scrollIntoView({ behavior: 'smooth' }); // Scroll to the spinner
        }
    }, [isLoading]);

    // Go to folder when clicked on folder name
    const goToFolder = (index) => {
        if (index === 0) { 
            setFolderId(rootFolderId);
            setFolderName(shared ? 'Shared Folder' : 'My drive');
            setUpdated('true');
            return;
        }
        let folderNames = folderName.split(' > ');
        let newFolderName = folderNames[index].trim();
        let newfolder = folders.find(folder => folder.name === newFolderName);
        if (newfolder) {
            setFolderName(folderName.split(' > ').slice(0, index + 1).join(' > '));
            setFolderId(newfolder.id);
        }
        setUpdated('true');
    };

    // return to parent folder when back button is clicked
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

    // Move a folder to another folder
    const handleDrop = (e, id) => {
        e.preventDefault();
        const draggedData = JSON.parse(e.dataTransfer.getData('application/json'));
        const draggedId = draggedData.id;
        const type = draggedData.type;
        if (parseInt(id) === parseInt(draggedId)) { return null };
        try {
            api.patch(`${baseUrl}/${type}/${draggedId}/${id}/move`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
            );
            setIsMovable(false)
        }
        catch (error) {
            console.error('Error moving folder:', error);
        }
        setFolderId(id); // go to new folder
        if (id === findParentFolderId(folders, folderId)) { // If folder is moved to previous folder
            setFolderName(folderName.split(' > ').slice(-1).join(' > ')); // remove last part of name
        } else {
            setFolderName(folderName + ' > ' + folders.find(folder => folder.id === id).name); // add new folder to name
        }
        setUpdated(false);
    };

    // Upload folder when folder is dropped in the drive
    const handleUploadFolder = async (event) => {
        event.stopPropagation();
        event.preventDefault();
        const items = event.dataTransfer.items;
        let parentId = folderId;
        setIsLoading(true);
        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (item) {
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
                    traverseFileTree(item, parentId, email, '', api, token, baseUrl, setIsLoading, setUpdated, folderId);
                }
            }
            !updated && setUpdated(true);
        }
        setIsLoading(false);
    };

    // If lazy loading is true, show loading spinner
    if (lazyLoading) {
        return (
            <span style={{ marginTop: '1rem' }}>Loading please wait...
                <LoadingSpinner />
            </span>
        );
    }

    // If user is not authenticated, show a message to sign in
    if (!isAuth) {
        return (
            <AuthMessage shared={shared} url={url} />);
    }

    // If user is authenticated, show the drive
    else {
        return (
            <Container>
                <DriveTitle shared={shared} />
                <Row className="drive">
                    <div className="folders" style={{ marginTop: '1rem', marginBottom: '1rem' }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleUploadFolder(e)}>       
                        <h3 id='folderName'>
                        {/* Split the folder path into navigation links to parent folders  */}
                        {folderName.split('>').map((name, index) => (<span key={`${name}-${index}`}>
                                <Button className="btn btn-link"
                                    style={{ color: 'white' }}
                                    onClick={() => { goToFolder( index) }}>
                                    {name}
                                </Button>
                                {index !== folderName.split('>').length - 1 && '>'}
                            </span>
                            ))}
                        </h3>

                        {!isRoot && // Show back button if folder is not root
                          <BackButton 
                          handleBackClick={handleBackClick} 
                          handleDrop={handleDrop} 
                          folders={folders} 
                          folderId={folderId} 
                      />}
                        {folders && // Show folders if they exist
                        <FoldersList folders={folders} isAuth={isAuth} isRoot={isRoot} shared={shared} isDesktop={isDesktop} folderId={folderId} handleDrop={handleDrop} setFolderId={setFolderId} setFolderName={setFolderName} folderName={folderName} setFolders={setFolders} setShareFolderId={setShareFolderId} setShareFolderName={setShareFolderName} setUpdated={setUpdated} isLoading={isLoading} setIsLoading={setIsLoading} setDownloadProgress={setDownloadProgress}
                            shareFolderRef={shareFolderRef}
                            shareableLink={shareableLink}
                            setShareableLink={setShareableLink}
                        />}
                        <CreateFolder setUpdated={setUpdated} folderId={folderId} /> 
                        
                        {(!isRoot || shared) // dont show files in root folder it would only show no files found
                            &&
                            <div>
                                <FilesList folderId={folderId} showUpload={!isRoot || shared}// dont show upload form in root folder
                                    setIsLoading={setIsLoading}
                                    setDownloadProgress={setDownloadProgress}
                                    showRenameFile={showRenameFile} setShowRenameFile={setShowRenameFile}
                                    isMovable={isMovable} setIsMovable={setIsMovable}
                                    shared={shared}
                                    setUpdated={setUpdated}
                                />
                            </div>
                        }

                        <div ref={shareFolderRef}></div>
                        {
                            shareableLink &&
                            <CreateShareableLink folderId={shareFolderId} folderName={shareFolderName}
                                shareableLink={shareableLink}
                                setShareableLink={setShareableLink} />}
                        {
                            downloadProgress > 0 && isLoading &&
                            <ProgressBar now={downloadProgress} label={`${downloadProgress}%`} />
                        }

                        <span ref={spinnerRef}>
                            {isLoading && // Show spinner when loading
                                <span style={{ marginTop: '1rem' }}>Loading please wait...
                                    <LoadingSpinner />
                                </span>}
                        </span>
                    </div>
                </Row>
            </Container>
        );
    }
}

export default Drive;
