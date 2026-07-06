import React, { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [form, setForm] = useState({ title: '', description: '', category: '', price: '', artistId: '' });
  const [original, setOriginal] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('Uploading...');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => data.append(key, val));
      data.append('original', original);
      data.append('preview', preview);

      const res = await axios.post('/api/artworks', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus(`Uploaded! Artwork ID: ${res.data.artworkId}`);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h2>Upload artwork</h2>
      <input name="artistId" placeholder="Your artist user ID" onChange={handleChange} required />
      <input name="title" placeholder="Title" onChange={handleChange} required />
      <textarea name="description" placeholder="Description" onChange={handleChange} />
      <input name="category" placeholder="Category" onChange={handleChange} />
      <input name="price" type="number" placeholder="Price (USD)" onChange={handleChange} required />
      <label>Original high-res file<input type="file" onChange={e => setOriginal(e.target.files[0])} required /></label>
      <label>Preview/watermarked image<input type="file" onChange={e => setPreview(e.target.files[0])} required /></label>
      <button type="submit">Upload</button>
      {status && <p>{status}</p>}
    </form>
  );
}
