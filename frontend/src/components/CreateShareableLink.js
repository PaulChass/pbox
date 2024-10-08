import React, { useState } from 'react';
import api , { baseUrl } from '../api.js'; // Adjust the path according to your file structure
import { Button } from 'react-bootstrap';

const CreateShareableLink = ({ folderId, folderName, shareableLink, setShareableLink }) => {
  const [type, setType] = useState('private'); // Default to private link
  const [expiresAt, setExpiresAt] = useState('');
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      };

      // Send request to backend to create shareable link
      const response = await api.post(`${baseUrl}/shareable-links/create`, {
        email: localStorage.getItem('email'),
        type,
        folderId,
        expiresAt: expiresAt || null, // Optionally send expiration date if provided
      }, config);
      setShareableLink(response.data.link); // Assuming response.data.link contains the link object

      console.log('Shareable link created:', response.data.link);
      // Optionally handle success, e.g., show a success message or redirect
    } catch (error) {
      console.error('Failed to create shareable link:', error);
      // Optionally handle error, e.g., show an error message
    }
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      // Optional: Display a message that the link was copied.
      alert("Link copied to clipboard!");
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className='shareableLink'>
      <h3>Create share link for: {folderName}</h3>
      <form onSubmit={handleSubmit}>
        
          <div> <label htmlFor="type">Type:</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="private">Private</option>
              <option value="public">Public</option>
              </select>
          </div>
       

        <div>

        </div>
        <div>
          <label htmlFor="expiresAt">Expires At:</label>
          <input
            type="datetime-local"
            id="expiresAt"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        <Button type="submit">Generate Link</Button>
        {shareableLink && (
          <div>
            {/* Display the shareable link */}
            <a href={`https://pbox.paulchasseuil.fr/shareable-link/${shareableLink.token}`} target="_blank" rel="noopener noreferrer">
                        { shareableLink.token &&  
                  `https://pbox.paulchasseuil.fr/shareable-link/${shareableLink.token}`}
            </a>
            <br />
            { shareableLink.token &&  
              <Button onClick={() => copyToClipboard(`https://pbox.paulchasseuil.fr/shareable-link/${shareableLink.token}`)}>Copy Link</Button>
            }
              </div>
        )}
      </form>
    </div>
  );
};

export default CreateShareableLink;
