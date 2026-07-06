import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext.jsx';

export default function MyUploads() {
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    axios.get(`/api/artworks/my-uploads/${user.userId}`)
      .then(res => setArtworks(res.data))
      .catch(err => setError(err.message));
  }, [user]);

  if (!user) return <p style={{ padding: '1rem' }}>Log in to see your uploads.</p>;
  if (error) return <p style={{ padding: '1rem' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>My Uploads</h2>
      {artworks.length === 0 && <p>You haven't uploaded anything yet.</p>}
      {artworks.map(art => (
        <div key={art.ArtworkId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <img src={art.PreviewImageUrl} alt={art.Title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
          <div>
            <strong>{art.Title}</strong> ({art.Category})
            <p style={{ margin: '0.25rem 0' }}>Price: ${art.Price}</p>
            <p style={{ margin: '0.25rem 0' }}>
              Status: {art.IsSold ? <span style={{ color: '#c0392b' }}>Sold</span> : <span style={{ color: '#27ae60' }}>Available</span>}
            </p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: '#666' }}>{new Date(art.CreatedAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}