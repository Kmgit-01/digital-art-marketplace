import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function ArtworkDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buying, setBuying] = useState(false);
  const [purchase, setPurchase] = useState(null);
  const [buyError, setBuyError] = useState('');

  useEffect(() => {
    api.get(`/artworks/${id}`)
      .then((res) => setArtwork(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBuying(true);
    setBuyError('');
    try {
      const res = await api.post('/transactions/purchase', {
        artworkId: Number(id),
        buyerId: user.userId,
        paymentRef: `demo-${Date.now()}`,
      });
      setPurchase(res.data);
      setArtwork((prev) => ({ ...prev, IsSold: true }));
    } catch (err) {
      setBuyError(err.response?.data?.error || err.message);
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading artwork...</p>
      </div>
    );
  }

  if (error || !artwork) {
    return <div className="alert alert-error">{error || 'Artwork not found'}</div>;
  }

  const isSold = artwork.IsSold || purchase;

  return (
    <>
      <Link to="/" className="back-link">← Back to gallery</Link>

      <div className="detail-page">
        <div className="detail-image">
          <img src={artwork.PreviewImageUrl} alt={artwork.Title} />
        </div>

        <div className="detail-info">
          {artwork.Category && (
            <div className="artwork-card-category">{artwork.Category}</div>
          )}
          <h1>{artwork.Title}</h1>

          <div className="detail-meta">
            <span className="meta-chip">Artist #{artwork.ArtistId}</span>
            <span className="meta-chip">
              {new Date(artwork.CreatedAt).toLocaleDateString()}
            </span>
            <span className="meta-chip">
              Royalty: {artwork.RoyaltyPercent || 10}%
            </span>
          </div>

          <div className="detail-price">${Number(artwork.Price).toFixed(2)}</div>

          {artwork.Description && (
            <p className="detail-description">{artwork.Description}</p>
          )}

          {purchase ? (
            <div className="purchase-success">
              <h3>Purchase confirmed</h3>
              <p>Transaction ID: #{purchase.transactionId}</p>
              {purchase.isResale ? (
                <>
                  <p>Artist royalty (25%): ${Number(purchase.royaltyAmount).toFixed(2)}</p>
                  <p>Seller payout (75%): ${Number(purchase.sellerPayout).toFixed(2)}</p>
                </>
              ) : (
                <p>First sale — full amount to artist: ${Number(purchase.sellerPayout).toFixed(2)}</p>
              )}
              <p>Personal license issued to you.</p>
              <Link to="/my-purchases" className="btn btn-secondary btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                View in My Purchases
              </Link>
            </div>
          ) : isSold ? (
            <div className="alert alert-warning">This artwork has been sold.</div>
          ) : (
            <div className="purchase-box">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Purchase includes a personal-use license. Resales automatically pay 25% royalty to the original artist.
              </p>
              {buyError && <div className="alert alert-error">{buyError}</div>}
              <button
                className="btn btn-primary"
                onClick={handleBuy}
                disabled={buying}
              >
                {buying ? 'Processing...' : `Buy for $${Number(artwork.Price).toFixed(2)}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
