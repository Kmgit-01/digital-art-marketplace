import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: 'Digital', price: '' });
  const [original, setOriginal] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!original || !preview) {
      setError('Please select both original and preview files.');
      return;
    }

    setError('');
    setStatus('Uploading to cloud storage...');

    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('category', form.category);
      data.append('price', form.price);
      data.append('artistId', user.userId);
      data.append('original', original);
      data.append('preview', preview);

      const res = await api.post('/artworks', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setStatus('');
      navigate(`/artwork/${res.data.artworkId}`);
    } catch (err) {
      setStatus('');
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Upload artwork</h1>
        <p>Share your creation with collectors worldwide</p>
      </div>

      <div className="alert alert-info">
        Want to resell artwork you&apos;ve purchased? Go to{' '}
        <Link to="/my-purchases" style={{ color: 'inherit', fontWeight: 600 }}>My Purchases</Link>{' '}
        — resales keep the original artist&apos;s 25% royalty intact.
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {status && <div className="alert alert-info">{status}</div>}

      <form onSubmit={handleSubmit} className="form-card form-card-wide">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" className="form-input" placeholder="Artwork title" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" className="form-textarea" placeholder="Tell collectors about your piece..." onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" className="form-select" onChange={handleChange} value={form.category}>
            <option value="Digital">Digital</option>
            <option value="Abstract">Abstract</option>
            <option value="Portrait">Portrait</option>
            <option value="Landscape">Landscape</option>
            <option value="Illustration">Illustration</option>
            <option value="3D">3D</option>
            <option value="Photography">Photography</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (USD)</label>
          <input id="price" name="price" type="number" min="0" step="0.01" className="form-input" placeholder="99.00" onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Original high-res file</label>
          <label className="file-upload">
            <input type="file" accept="image/*,.psd,.ai" onChange={(e) => setOriginal(e.target.files[0])} />
            <div className="file-upload-label">
              <strong>Choose file</strong> — full resolution original
            </div>
            {original && <div className="file-name">{original.name}</div>}
          </label>
        </div>

        <div className="form-group">
          <label>Preview / watermarked image</label>
          <label className="file-upload">
            <input type="file" accept="image/*" onChange={(e) => setPreview(e.target.files[0])} />
            <div className="file-upload-label">
              <strong>Choose file</strong> — public preview shown in gallery
            </div>
            {preview && <div className="file-name">{preview.name}</div>}
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={!!status}>
            {status || 'Upload artwork'}
          </button>
        </div>
      </form>
    </>
  );
}
