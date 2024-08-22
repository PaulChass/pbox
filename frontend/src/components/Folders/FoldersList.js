
/**
 * FolderList component
 * @param {string} folderId - The folder id
 * @param {function} setFolderId - Function to set the folder id
 * @param {function} setFolders - Function to set the folders
 * @param {function} setShareFolderId - Function to set the share folder id
 * @param {function} setShareFolderName - Function to set the share folder name
 * @param {function} setUpdated - Function to set the updated state
 * @param {string} token - The user token
 * @param {boolean} shared - Boolean to check if the folder is shared
 * @param {string} url - The shared link url
 * @param {string} rootFolderId - The root folder id
 * @param {function} setRootFolderId - Function to set the root folder id
 * @param {string} email - The user email
 * @param {string} folderName - The folder name
 * @param {function} setFolderName - Function to set the folder name
 * @param {boolean} isLoading - Boolean to check if the folder is loading
 * @param {function} setIsLoading - Function to set the loading state
 * @param {function} setDownloadProgress - Function to set the download progress
 * @param {object} shareFolderRef - The share folder reference
 * @returns {JSX.Element} - FolderList component
 * 
 * 
 */
import React from 'react';
import FolderItem from './FolderItem';



const FoldersList = ({ folders ,isAuth, isRoot ,shared , isDesktop, folderId, handleDrop, setFolderId, setFolderName
  , folderName , setFolders, setShareFolderId, setShareFolderName, setUpdated, isLoading, setIsLoading, setDownloadProgress, shareFolderRef
  , shareableLink, setShareableLink
 }) => {
    // Loop through folders and render them
    const renderFolders = (folders) => {
        // If there are no folders and user is authenticated show welcome message
        if (folders.length === 0 && isAuth) {
            if (isRoot && !shared) {
                return isDesktop ? <p className='mt-1 mb-4'>Welcome to your drive. Create a folder or drag a folder to get started</p>
                    : <p className='mt-1 pb-3'> Welcome to your drive . Create a folder or drag a folder here</p>
            } else {
                return <p></p>;
            }
        } else {
            // If there are folders, render them
            return folders
                .filter(folder => folder.parent_id === folderId)
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort folders by alphabetical order
                .map(folder => (
                  <FolderItem folder={folder}  folders={folders} handleDrop={handleDrop} 
                  setFolderId={setFolderId} setFolders={setFolders} setShareFolderId={setShareFolderId}
                   setShareFolderName={setShareFolderName} setUpdated={setUpdated} isLoading={isLoading} 
                   setIsLoading={setIsLoading} setDownloadProgress={setDownloadProgress} 
                   shareFolderRef={shareFolderRef} key={folder.id} 
                   folderName={folderName} setFolderName={setFolderName}
                   shareableLink={shareableLink}
                   setShareableLink={setShareableLink}                   />
                )
                );
        }
    };

    return (
        <div className='folder-list'>
            {renderFolders(folders)}
        </div>
    );
}
export default FoldersList;