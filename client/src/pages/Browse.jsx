import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Browse() {
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/artworks')
      .then(res => setArtworks(res.data))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p style={{ padding: '1rem' }}>Error loading artworks: {error}</p>;

  return (
    <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
      {artworks.length === 0 && <p>No artworks yet — be the first to upload one.</p>}
      {artworks.map(art => (
        <div key={art.ArtworkId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '0.75rem' }}>
          <img src={art.PreviewImageUrl} alt={art.Title} style={{ width: '100%', borderRadius: '6px' }} />
          <h3>{art.Title}</h3>
          <p>{art.Category}</p>
          <strong>${art.Price}</strong>
        </div>
      ))}
    </div>
  );
}
