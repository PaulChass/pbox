/**
 * File Utilities
 * 
 * This file contains utility functions for working with files.
 * 
 */


// Function to get the file name without its extension
export const getFileNameWithoutExtension = (fileName) => {
    return fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
};

// Function to get the file extension
export const getFileExtension = (fileName) => {
    return fileName.split('.').pop();
};

// Function to check if the file is a video file
export const isVideoFile = (fileExtension) => {
    return ['mp4', 'avi', 'mkv'].includes(fileExtension.toLowerCase());
};

// Function to check if the user is on mobile Chrome and the file is a PDF
export const isPDFOnMobileChrome = (fileExtension, userAgent) => {
    return fileExtension.toLowerCase() === 'pdf' && /Chrome/.test(userAgent) && /Android/.test(userAgent);
};

export const truncateFileName = (name) => {
    if ( name.length > 30) {
        return `${name.substring(0, 20)}...${name.substring(name.length - 10)}`;
    }
    return name;
};

//set correct video type
export const getType = (videoFileName) => {
    switch (videoFileName.split('.').pop()) {
        case 'webm':
            return 'video/webm' ;
            case 'ogg':
                return 'video/ogg';
            case 'mkv':
                return 'video/x-matroska';
            default:
                return 'video/mp4';
    }
    };