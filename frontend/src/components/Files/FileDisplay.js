import React from 'react';
import FileIcon from './FileIcon';
import '../../styles/FileDisplay.css';
import { truncateFileName } from './FileUtililities';

/**
 * Component to display the file name and icon.
 * @param {Object} props - Component props
 * @param {string} props.name - The name of the file
 * @returns {JSX.Element} - File icon and name
 * 
 */

 
const FileDisplay = ({ name }) => 
    {
    // Truncate the file name if longer than 30 characters on desktop
    // or 18 characters on mobile
    const truncatedName = truncateFileName(name);

    // Display the file icon and shortened name
    return (
        <span style={{ margin: '0.2rem' }}>
            <FileIcon name={name} />
            {truncatedName}  
        </span>
    );
};

export default FileDisplay;