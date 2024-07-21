import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { BsThreeDotsVertical } from 'react-icons/bs';
import DownloadFile from './DownloadFile';
import DeleteFileButton from './DeleteFileButton';

/**
 * Component for displaying a dropdown menu with file actions (download, delete, rename, move).
 * @param {Object} props - Component props
 * @param {Object} props.file - The file object for which actions are being displayed
 * @param {Function} props.setIsLoading - Function to set loading state
 * @param {Function} props.setDownloadProgress - Function to set download progress
 * @param {Function} props.setFiles - Function to update the files list
 * @param {Function} props.setIsMovable - Function to set if the file/folder is movable
 * @param {Function} props.setShowRenameFileId - Function to set the ID of the file to be renamed
 */

const FileActionsDropdown = ({ file, setIsLoading, setDownloadProgress, setFiles, setIsMovable, setShowRenameFileId }) => {
    /**
     * Handles click events on the dropdown items.
     * @param {string} id - The ID of the file on which the action is performed
     * @param {string} type - The type of action to be performed (move, renameFile)
     * 
     * @example
     * <FileActionDropdown file={file} setIsLoading={setIsLoading} setDownloadProgress={setDownloadProgress} setFiles={setFiles} setIsMovable={setIsMovable} setShowRenameFileId={setShowRenameFileId} />
     */

    // Check url to see if this is a shared folder
    const isShared = window.location.pathname.includes('/shareable');
    if (isShared) {
           return <DownloadFile file={file} setIsLoading={setIsLoading} setDownloadProgress={setDownloadProgress} icon = {true} />   
    }
    else { 
    return (
        <Dropdown>
            <Dropdown.Toggle variant="dark" id={`dropdown-files-${file.id}`} custom="true" className='dropdown-toggle no-arrow'>
                <BsThreeDotsVertical />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item>
                    <DownloadFile file={file} setIsLoading={setIsLoading} setDownloadProgress={setDownloadProgress} />
                </Dropdown.Item>
                <Dropdown.Item>
                    <DeleteFileButton fileId={file.id} setFiles={setFiles} />
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setShowRenameFileId(file.id)}>
                    Rename
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setIsMovable(true)}>
                    Move
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    );
}
};

export default FileActionsDropdown;