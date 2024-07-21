import React from 'react';
import { isDesktop } from 'react-device-detect';
    

const VideoPlayer = ({ currentVideoUrl}) => {
	return (
		<div>
			<div className="alert videoAlert">
				If the video does not stream correctly, consider using a different browser or downloading the file.
			</div>
			<video name={currentVideoUrl.split('/').pop()} width={isDesktop ? "640" : "320"} height="auto" controls>
				<source src={currentVideoUrl} type="video/mp4" />
				Your browser does not support the video tag.
			</video>
		</div>
	);
};

export default VideoPlayer;