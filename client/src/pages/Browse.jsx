import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext.jsx';

export default function Browse() {
  const [artworks, setArtworks] = useState([]);
  const [error, setError] = useState(null);
  const [buyStatus, setBuyStatus] = useState({});
  const [purchased, setPurchased] = useState({});
  const { user } = useAuth();

  const loadArtworks = () => {
    axios.get('/api/artworks')
      .then(res => setArtworks(res.data))
      .catch(err => setError(err.message));
  };

  useEffect(() => { loadArtworks(); }, []);

  const handleBuy = async (artworkId) => {
    if (!user) {
      setBuyStatus(prev => ({ ...prev, [artworkId]: 'Please log in first.' }));
      return;
    }
    setBuyStatus(prev => ({ ...prev, [artworkId]: 'Processing payment...' }));
    try {
      const res = await axios.post('/api/transactions/purchase', {
        artworkId,
        buyerId: user.userId,
        paymentRef: `demo-${Date.now()}`
      });
      setPurchased(prev => ({
        ...prev,
        [artworkId]: {
          transactionId: res.data.transactionId,
          royaltyAmount: res.data.royaltyAmount
        }
      }));
      setBuyStatus(prev => ({ ...prev, [artworkId]: '' }));
    } catch (err) {
      setBuyStatus(prev => ({ ...prev, [artworkId]: `Error: ${err.response?.data?.error || err.message}` }));
    }
  };

  if (error) return <p style={{ padding: '1rem' }}>Error loading artworks: {error}</p>;

  return (
    <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
      {artworks.length === 0 && <p>No artworks yet — be the first to upload one.</p>}
      {artworks.map(art => {
        const bought = purchased[art.ArtworkId];
        return (
          <div key={art.ArtworkId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '0.75rem', position: 'relative' }}>
            <img src={art.PreviewImageUrl} alt={art.Title} style={{ width: '100%', borderRadius: '6px', opacity: bought ? 0.5 : 1 }} />
            <h3>{art.Title}</h3>
            <p>{art.Category}</p>
            <strong>${art.Price}</strong>
            <div style={{ marginTop: '0.5rem' }}>
              {!bought ? (
                <>
                  <button onClick={() => handleBuy(art.ArtworkId)}>Buy</button>
                  {buyStatus[art.ArtworkId] && <p style={{ fontSize: '0.85rem' }}>{buyStatus[art.ArtworkId]}</p>}
                </>
              ) : (
                <div style={{ background: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '6px', padding: '0.5rem', fontSize: '0.85rem' }}>
                  <strong>✅ Purchase confirmed</strong>
                  <p style={{ margin: '0.25rem 0' }}>Transaction ID: {bought.transactionId}</p>
                  <p style={{ margin: '0.25rem 0' }}>Royalty paid: ${bought.royaltyAmount}</p>
                  <p style={{ margin: '0.25rem 0' }}>License issued to buyer #{user.userId}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}