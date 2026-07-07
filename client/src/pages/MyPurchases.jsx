import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resellStatus, setResellStatus] = useState({});
  const { user } = useAuth();

  const load = () => {
    if (!user) {
      setLoading(false);
      return;
    }

    api.get(`/transactions/my-purchases/${user.userId}`)
      .then((res) => setPurchases(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [user]);

  const handleResell = async (artworkId) => {
    setResellStatus((prev) => ({ ...prev, [artworkId]: 'Relisting...' }));
    try {
      await api.post(`/artworks/${artworkId}/resell`, { ownerId: user.userId });
      setResellStatus((prev) => ({ ...prev, [artworkId]: 'Relisted! Now visible in the gallery.' }));
    } catch (err) {
      setResellStatus((prev) => ({
        ...prev,
        [artworkId]: err.response?.data?.error || err.message,
      }));
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading your purchases...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <>
      <div className="page-header">
        <h1>My Purchases</h1>
        <p>Your collection and resale options</p>
      </div>

      {purchases.length === 0 ? (
        <div className="empty-state">
          <h3>No purchases yet</h3>
          <p>Explore the gallery and find something you love.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Browse gallery
          </Link>
        </div>
      ) : (
        purchases.map((p) => (
          <div key={p.TransactionId} className="list-card">
            <img src={p.PreviewImageUrl} alt={p.Title} className="list-card-thumb" />
            <div className="list-card-content">
              <div className="list-card-title">{p.Title}</div>
              <div className="list-card-meta">{p.Category}</div>
              <div className="list-card-meta">
                Paid: ${Number(p.Amount).toFixed(2)}
                {Number(p.RoyaltyAmount) > 0 && ` · Royalty: $${Number(p.RoyaltyAmount).toFixed(2)}`}
              </div>
              <div className="list-card-meta">
                {p.PaymentStatus} · Transaction #{p.TransactionId}
              </div>
              <div className="list-card-meta">{new Date(p.TransactionDate).toLocaleString()}</div>
              {resellStatus[p.ArtworkId] && (
                <div className={`alert ${resellStatus[p.ArtworkId].startsWith('Relisted') ? 'alert-success' : resellStatus[p.ArtworkId] === 'Relisting...' ? 'alert-info' : 'alert-error'}`} style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  {resellStatus[p.ArtworkId]}
                </div>
              )}
            </div>
            <div className="list-card-actions">
              <Link to={`/artwork/${p.ArtworkId}`} className="btn btn-secondary btn-sm">View</Link>
              <button className="btn btn-primary btn-sm" onClick={() => handleResell(p.ArtworkId)}>
                Resell
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
}
