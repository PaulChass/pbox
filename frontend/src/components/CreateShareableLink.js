import React, { useState } from 'react';
import axios from 'axios';

const CreateShareableLink = ({ folderId }) => {
  const [shareableLink, setShareableLink] = useState(null);
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
      const response = await axios.post('http://localhost:5000/api/shareable-links/create', {
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

  return (
    <div>
      <h2>Create Shareable Link</h2>
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
        <button type="submit">Generate Link</button>
        {shareableLink && (
          <div>
            <p>Shareable Link:</p>
            <a href={`http://localhost:3000/shareable-link/${shareableLink.token}`} target="_blank" rel="noopener noreferrer">
              Click to Access
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateShareableLink;
