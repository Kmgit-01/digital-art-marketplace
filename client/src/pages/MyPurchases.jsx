import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext.jsx';

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState(null);
  const [resellStatus, setResellStatus] = useState({});
  const { user } = useAuth();

  const load = () => {
    if (!user) return;
    axios.get(`/api/transactions/my-purchases/${user.userId}`)
      .then(res => setPurchases(res.data))
      .catch(err => setError(err.message));
  };

  useEffect(() => { load(); }, [user]);

  const handleResell = async (artworkId) => {
    setResellStatus(prev => ({ ...prev, [artworkId]: 'Relisting...' }));
    try {
      await axios.post(`/api/artworks/${artworkId}/resell`, { ownerId: user.userId });
      setResellStatus(prev => ({ ...prev, [artworkId]: 'Relisted! Now visible in Browse.' }));
    } catch (err) {
      setResellStatus(prev => ({ ...prev, [artworkId]: `Error: ${err.response?.data?.error || err.message}` }));
    }
  };

  if (!user) return <p style={{ padding: '1rem' }}>Log in to see your purchases.</p>;
  if (error) return <p style={{ padding: '1rem' }}>Error: {error}</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>My Purchases</h2>
      {purchases.length === 0 && <p>No purchases yet.</p>}
      {purchases.map(p => (
        <div key={p.TransactionId} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <img src={p.PreviewImageUrl} alt={p.Title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
          <div style={{ flex: 1 }}>
            <strong>{p.Title}</strong> ({p.Category})
            <p style={{ margin: '0.25rem 0' }}>Amount paid: ${p.Amount} | Royalty: ${p.RoyaltyAmount}</p>
            <p style={{ margin: '0.25rem 0' }}>Status: {p.PaymentStatus} | Transaction #{p.TransactionId}</p>
            <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', color: '#666' }}>{new Date(p.TransactionDate).toLocaleString()}</p>
            <button onClick={() => handleResell(p.ArtworkId)}>Resell this artwork</button>
            {resellStatus[p.ArtworkId] && <p style={{ fontSize: '0.85rem' }}>{resellStatus[p.ArtworkId]}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}