import { useEffect, useState, useMemo } from 'react';
import api from '../api/client';
import ArtworkCard from '../components/ArtworkCard';

const CATEGORIES = ['All', 'Digital', 'Abstract', 'Portrait', 'Landscape', 'Illustration', '3D', 'Photography'];

export default function Home() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    api.get('/artworks')
      .then((res) => setArtworks(res.data))
      .catch((err) => setError(err.response?.data?.error || err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return artworks.filter((art) => {
      const matchesSearch = art.Title.toLowerCase().includes(search.toLowerCase()) ||
        (art.Category || '').toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || art.Category === category;
      return matchesSearch && matchesCategory;
    });
  }, [artworks, search, category]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading artworks...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">Failed to load artworks: {error}</div>;
  }

  return (
    <>
      <section className="hero">
        <h1>Discover Digital Art</h1>
        <p>Browse unique creations from talented artists. Buy, collect, and resell with built-in royalty protection.</p>
      </section>

      <div className="filters-bar">
        <input
          type="search"
          className="search-input"
          placeholder="Search by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`pill${category === cat ? ' active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h3>No artworks found</h3>
          <p>{artworks.length === 0 ? 'Be the first to upload a piece.' : 'Try adjusting your search or filters.'}</p>
        </div>
      ) : (
        <div className="artwork-grid">
          {filtered.map((art) => (
            <ArtworkCard key={art.ArtworkId} artwork={art} />
          ))}
        </div>
      )}
    </>
  );
}
