import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MyUploads() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    api.get(`/artworks/my-uploads/${user.userId}`)
      .then((res) => setArtworks(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading your uploads...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <>
      <div className="page-header">
        <h1>My Uploads</h1>
        <p>Track your listed artworks and sales</p>
      </div>

      {artworks.length === 0 ? (
        <div className="empty-state">
          <h3>No uploads yet</h3>
          <p>Start sharing your art with the world.</p>
          <Link to="/upload" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            Upload artwork
          </Link>
        </div>
      ) : (
        artworks.map((art) => (
          <div key={art.ArtworkId} className="list-card">
            <img src={art.PreviewImageUrl} alt={art.Title} className="list-card-thumb" />
            <div className="list-card-content">
              <div className="list-card-title">{art.Title}</div>
              <div className="list-card-meta">{art.Category} · ₹{Number(art.Price).toFixed(2)}</div>
              <div className="list-card-meta">
                Status:{' '}
                {art.IsSold ? (
                  <span className="status-sold">Sold</span>
                ) : (
                  <span className="status-available">Available</span>
                )}
              </div>
              <div className="list-card-meta">{new Date(art.CreatedAt).toLocaleString()}</div>
            </div>
            <div className="list-card-actions">
              <Link to={`/artwork/${art.ArtworkId}`} className="btn btn-secondary btn-sm">View</Link>
            </div>
          </div>
        ))
      )}
    </>
  );
}
