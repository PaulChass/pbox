import React, {useState} from 'react';
import FileActionsDropdown from './FileActionsDropdown';
import FileDisplay from './FileDisplay';
import RenameFile from './RenameFile';

const FileItem = ({
    file,
    isMovable,
    setFiles,
    handleFileClick,
    setIsLoading,
    setDownloadProgress,
    setIsMovable,
}) => {

    const [showRenameFileId, setShowRenameFileId] = useState(null);


    const handleDragStart = (e) => {
        const dragData = JSON.stringify({ id: file.id, type: 'files' });
        e.dataTransfer.setData('application/json', dragData);
    };

    return (
        <li
            key={file.id}
            style={{ display: 'flex', justifyContent: 'center' }}
            draggable={isMovable}
            onDragStart={handleDragStart}
            onDragOver={(e) => e.preventDefault()}
        >
            {(showRenameFileId === file.id) ? (
                <RenameFile fileId={file.id} setFiles={setFiles} setShowRenameFileId={setShowRenameFileId} />
            ) : (
                <button onClick={() => handleFileClick(file.id, file.name)} style={{ textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', color: 'white' }}>
                    <FileDisplay name={file.name} />
                </button>
            )}
            <FileActionsDropdown
                file={file}
                setFiles={setFiles}
                handleFileClick={handleFileClick}
                setIsLoading={setIsLoading}
                setDownloadProgress={setDownloadProgress}
                setIsMovable={setIsMovable}
            />
        </li>
    );
};

export default FileItem;