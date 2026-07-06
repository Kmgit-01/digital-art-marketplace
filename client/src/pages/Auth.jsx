import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'buyer' });
  const [status, setStatus] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus(mode === 'login' ? 'Logging in...' : 'Registering...');
    try {
      if (mode === 'register') {
        const res = await axios.post('/api/users/register', form);
        login({ userId: res.data.userId, fullName: form.fullName, role: form.role });
        setStatus('Registered!');
      } else {
        const res = await axios.post('/api/users/login', { email: form.email, password: form.password });
        login(res.data.user);
        setStatus('Logged in!');
      }
      navigate('/');
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '360px' }}>
      <h2>{mode === 'login' ? 'Log in' : 'Register'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {mode === 'register' && (
          <input name="fullName" placeholder="Full name" onChange={handleChange} required />
        )}
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        {mode === 'register' && (
          <select name="role" onChange={handleChange} value={form.role}>
            <option value="buyer">Buyer</option>
            <option value="artist">Artist</option>
          </select>
        )}
        <button type="submit">{mode === 'login' ? 'Log in' : 'Register'}</button>
      </form>
      {status && <p>{status}</p>}
      <p style={{ marginTop: '1rem' }}>
        {mode === 'login' ? (
          <>No account? <button onClick={() => setMode('register')}>Register</button></>
        ) : (
          <>Have an account? <button onClick={() => setMode('login')}>Log in</button></>
        )}
      </p>
    </div>
  );
}