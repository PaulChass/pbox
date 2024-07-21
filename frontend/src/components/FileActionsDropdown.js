import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { BsThreeDotsVertical } from 'react-icons/bs';
import DownloadFile from './DownloadFile'; // Adjust the path as necessary
import DeleteFile from './DeleteFile'; // Adjust the path as necessary


const FileActionsDropdown = ({ file, setIsLoading, setDownloadProgress, setFiles, setIsMovable, setShowRenameFileId }) => {
    
    const handleClick = (id, type) => {
        if (type === 'move') {
            setIsMovable(true);
            alert('You can now drag folders and files to another folder.');
        }
        if (type === 'renameFile') {
            setShowRenameFileId(id);
        }
    };

    return (
    <Dropdown>
        <Dropdown.Toggle variant="dark" id={`dropdown-files-${file.id}`} custom="true" className='no-arrow'>
            <BsThreeDotsVertical />
        </Dropdown.Toggle>
        <Dropdown.Menu>
            <Dropdown.Item>
                <DownloadFile file={file} setIsLoading={setIsLoading} setDownloadProgress={setDownloadProgress} />
            </Dropdown.Item>
            <Dropdown.Item>
                <DeleteFile fileId={file.id} setFiles={setFiles} />
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleClick(file.id, 'renameFile')}>
                Rename
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleClick(file.id, 'move')}>
                Move
            </Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>

);
};
export default FileActionsDropdown;