import React from 'react';
import FileIcon from './FileIcon';

const FileDisplay = ({ name }) => {
    const truncateFileName = (name) => {
        if (name.length > 25) {
            return `${name.substring(0, 15)}...${name.substring(name.length - 10)}`;
        }
        return name;
    };

    const truncatedName = truncateFileName(name);

    return (
        <span style={{ margin: '0.2rem' }}>
            <FileIcon name={name} />
            {truncatedName}
        </span>
    );
};

export default FileDisplay;