import React, { useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { BsFolder2Open, BsThreeDotsVertical } from 'react-icons/bs';
import RenameFolder from './RenameFolder';
import DownloadFolder from './DownloadFolder';
import DeleteFolder from './DeleteFolder';
import { truncateFolderName } from './FolderUtilities';

/**
 * FolderItem component displays a folder card with options to download, delete, share, rename, and move the folder.
 *  
 * @param {Object} props - Component props
 * @param {Object} props.folder - The folder object to be displayed
 * @param {Array} props.folders - The list of folders
 * @param {Function} props.handleDrop - Function to handle drag-and-drop events
 * @param {Function} props.setFolderId - Function to set the folder id
 * @param {Function} props.setFolders - Function to set the folders list
 * @param {Function} props.setShareFolderId - Function to set the folder id for sharing
 * @param {Function} props.setShareFolderName - Function to set the folder name for sharing
 * @param {boolean} props.setUpdated - Function to set the updated state
 * @param {boolean} props.isLoading - Flag indicating if the folder is loading
 * @param {Function} props.setIsLoading - Function to set the loading state
 * @param {Function} props.setDownloadProgress - Function to set the download progress
 * @param {Object} props.shareFolderRef - Reference to the share folder form
 * 
 * @returns {JSX.Element} FolderItem component
 * 
 * @example
 * return <FolderItem folder={folder} folders={folders} handleDrop={handleDrop} setFolderId={setFolderId} setFolders={setFolders} setShareFolderId={setShareFolderId} setShareFolderName={setShareFolderName} setUpdated={setUpdated} isLoading={isLoading} setIsLoading={setIsLoading} setDownloadProgress={setDownloadProgress} shareFolderRef={shareFolderRef} />;
 * 
 */

const FolderItem = ({ folder, folders, handleDrop, setFolderId, setFolders, setShareFolderId, setShareFolderName
	, isLoading, setIsLoading, setDownloadProgress, shareFolderRef, setFolderName, folderName,
	shareableLink, setShareableLink
}) => {
	const [showRename, setShowRename] = useState(false);
	const [showRenameId, setShowRenameId] = useState(null);
	const [isMovable, setIsMovable] = useState(false);
	const isSharedDrive = window.location.pathname.includes('shareable');

	// Handle clicks on folder or folder buttons
	const handleClick = (id, type = 'null') => {
		switch (type) {
			case 'createLink':
				// show create link form
				if (shareableLink) {
					setShareableLink(null);
				} else {
					setShareFolderId(id);
					setShareFolderName(folders.find(folder => folder.id === id).name);
					setShareableLink('loading');
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
					setFolderName(folderName + ' > ' + newFolder);
				}
				break;
		}
	};



	return (
		<div key={folder.id} className='flexCenter'>
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
							? <RenameFolder folderId={folder.id} setShowRename={setShowRename} setFolders={setFolders} />
							:
							<span><BsFolder2Open></BsFolder2Open> {truncateFolderName(folder.name)}</span>}
					</Card.Title>
				</Card.Body>
			</Card>
			<Dropdown>
				<Dropdown.Toggle variant="dark" id="dropdown-basic" custom="true" className='no-arrow'>
					<BsThreeDotsVertical />
				</Dropdown.Toggle>
				<Dropdown.Menu>
					<Dropdown.Item>
						<DownloadFolder folderId={folder.id} isLoading={isLoading} setIsLoading={setIsLoading} setShowRename={setShowRename} folderName={folder.name} setDownloadProgress={setDownloadProgress} />
					</Dropdown.Item>
					<Dropdown.Item onClick={() => handleClick(folder.id, 'createLink')}>
						Share
					</Dropdown.Item>
					{!isSharedDrive &&
					<>
						<Dropdown.Item>
							<DeleteFolder folderId={folder.id} setFolders={setFolders} />
						</Dropdown.Item>
					
					<Dropdown.Item onClick={() => handleClick(folder.id, 'rename')}>
						Rename
					</Dropdown.Item>
					<Dropdown.Item onClick={() => handleClick(folder.id, 'move')}>
						Move
					</Dropdown.Item></>}
				</Dropdown.Menu>
			</Dropdown>
		</div>
	);
};

export default FolderItem;