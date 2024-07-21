import React from "react";
import * as BsIcons from "react-icons/bs";

/** 
 * Component to display the icon corresponding to the file type.
 * @param {Object} props - Component props
 * @param {string} props.name - The name of the file
 * @returns {JSX.Element} - File icon
 */

const FileIcon = ({name}) => {
    // Returns the file extension from name
    const fileType = (name) => {
        const ext = name.split('.').pop();
        return ext;
    }

    // Display the corresponding icon 
    switch (fileType(name)) {
        case 'pdf':
            return <BsIcons.BsFileEarmarkPdf style={{ marginRight: '5px' }} />;
        case 'doc':
            return <BsIcons.BsFileEarmarkWord style={{ marginRight: '5px' }} />;
        case 'docx':
            return <BsIcons.BsFileEarmarkText style={{ marginRight: '5px' }} />;
        case 'txt':
            return <BsIcons.BsFileEarmarkText style={{ marginRight: '5px' }} />;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return <BsIcons.BsFileEarmarkImage style={{ marginRight: '5px' }} />;
        case 'svg':
        case 'json':
        case 'js':
        case 'css':
        case 'html':
        case 'xml':
        case 'php':
            return <BsIcons.BsFileEarmarkCode style={{ marginRight: '5px' }} />;

        case 'mp4':
        case 'avi':
        case 'mkv':
            return <BsIcons.BsFileEarmarkPlay style={{ marginRight: '5px' }} />;
        case 'mp3':
        case 'wav':
            return <BsIcons.BsFileEarmarkMusic style={{ marginRight: '5px' }} />;
        case 'zip':
        case 'rar':
            return <BsIcons.BsFileEarmarkZip style={{ marginRight: '5px' }} />;
        case 'xlsx':
        case 'xls':
            return <BsIcons.BsFileEarmarkSpreadsheet style={{ marginRight: '5px' }} />;
        case 'ppt':
        case 'pptx':
            return <BsIcons.BsFileEarmarkPpt style={{ marginRight: '5px' }} />;
        default:
            return <BsIcons.BsFileEarmark style={{ marginRight: '5px' }} />;
    }
}

export default FileIcon;


