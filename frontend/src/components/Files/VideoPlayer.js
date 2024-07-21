import React from 'react';
import { Player } from 'video-react';
import "video-react/dist/video-react.css"; // Import the CSS for video-react

/**
 * VideoPlayer component renders a media player with responsive width based on the device.
 * It displays an alert message for users in case the video does not stream correctly.
 * 
 * Props:
 * - currentVideoUrl: URL of the video to be played.
 */
const VideoPlayer = ({ currentVideoUrl }) => {
    // Determine if the device is a desktop
    const isDesktop = window.innerWidth > 1024;

    const downloadVideo = () => {
        const link = document.createElement('a');
        link.href = currentVideoUrl;
        link.target = '_blank'; 
        link.href = link.href.replace('/stream', '/downloadVideo');
        link.download = currentVideoUrl.split('/').pop();
        link.click();
    }
    
    return (
        <div>
            {/* Alert message for potential streaming issues */}
            <div className="alert videoAlert">
                If the video does not stream correctly, consider using a different browser or 
                <button className='btn btn-link videoAlert' onClick={()=>downloadVideo()}>downloading</button> 
                the file.
            </div>
            {/* Video player */}
            <Player
                playsInline
                src={currentVideoUrl}
                width={isDesktop ? 640 : 320}
                height="auto"
            />
        </div>
    );
};

export default VideoPlayer;