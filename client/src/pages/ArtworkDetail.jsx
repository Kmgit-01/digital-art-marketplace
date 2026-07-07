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
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (!id) return;

    Promise.all([
      api.get(`/artworks/${id}`),
      api.get(`/artworks/${id}/comments`),
    ])
      .then(([artworkRes, commentsRes]) => {
        setArtwork(artworkRes.data);
        setComments(commentsRes.data);
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
        setCommentError('Unable to load community discussion right now.');
      })
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setCommentError('Please sign in to join the discussion.');
      return;
    }

    const trimmed = commentText.trim();
    if (!trimmed) {
      setCommentError('Write a question or comment before posting.');
      return;
    }

    setCommentLoading(true);
    setCommentError('');

    try {
      const res = await api.post(`/artworks/${id}/comments`, {
        userId: user.userId,
        content: trimmed,
      });

      setComments((prev) => [
        {
          CommentId: res.data.commentId,
          Content: trimmed,
          CreatedAt: res.data.createdAt,
          UserId: user.userId,
          FullName: user.fullName || 'You',
          Role: user.role || 'buyer',
        },
        ...prev,
      ]);
      setCommentText('');
    } catch (err) {
      setCommentError(err.response?.data?.error || err.message);
    } finally {
      setCommentLoading(false);
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

          <div className="community-panel">
            <div className="community-header">
              <div>
                <h3>Community discussion</h3>
                <p>Ask questions, share feedback, or connect with the artist and fellow buyers.</p>
              </div>
            </div>

            {user ? (
              <form className="comment-form" onSubmit={handleCommentSubmit}>
                <textarea
                  className="form-textarea"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Start a conversation about this artwork..."
                  rows="4"
                />
                <div className="comment-form-actions">
                  <button type="submit" className="btn btn-primary btn-sm" disabled={commentLoading}>
                    {commentLoading ? 'Posting...' : 'Post comment'}
                  </button>
                </div>
                {commentError && <div className="alert alert-error">{commentError}</div>}
              </form>
            ) : (
              <div className="alert alert-info">
                Sign in to join the discussion and ask the artist or other buyers about this art.
              </div>
            )}

            <div className="community-list">
              {comments.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                  No conversations yet. Start the first one.
                </div>
              ) : (
                comments.map((comment) => (
                  <article key={comment.CommentId} className="community-item">
                    <div className="community-item-meta">
                      <strong>{comment.FullName}</strong>
                      <span className="role-tag">{comment.Role || 'buyer'}</span>
                      <span>{new Date(comment.CreatedAt).toLocaleString()}</span>
                    </div>
                    <p>{comment.Content}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
