import React from 'react';
import { Button } from 'react-bootstrap';
import { BsArrowReturnLeft } from 'react-icons/bs';
import { findParentFolderId } from './Folders/FolderUtilities.js';

const BackButton = ({ handleBackClick, handleDrop, folders, folderId }) => {
    return (
        <Button variant='secondary'
            style={{ width: '100%', marginTop: '2rem', marginBottom: '1rem' }}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleBackClick}
            onDrop={e => handleDrop(e, findParentFolderId(folders, folderId))}>
            <BsArrowReturnLeft />
        </Button>
    );
};

export default BackButton;