import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'buyer' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus(mode === 'login' ? 'Signing in...' : 'Creating account...');

    try {
      if (mode === 'register') {
        const res = await api.post('/users/register', form);
        login({ userId: res.data.userId, fullName: form.fullName, role: form.role });
        setStatus('');
        navigate('/');
      } else {
        const res = await api.post('/users/login', { email: form.email, password: form.password });
        login(res.data.user, res.data.token);
        setStatus('');
        navigate('/');
      }
    } catch (err) {
      setStatus('');
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
      <div className="form-card">
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
          <p>{mode === 'login' ? 'Sign in to buy and collect art' : 'Join as a buyer or artist'}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                name="fullName"
                className="form-input"
                placeholder="Jane Doe"
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="role">I am a</label>
              <select id="role" name="role" className="form-select" onChange={handleChange} value={form.role}>
                <option value="buyer">Buyer — browse and collect art</option>
                <option value="artist">Artist — upload and sell art</option>
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={!!status}>
              {status || (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </div>
        </form>

        <div className="auth-toggle">
          {mode === 'login' ? (
            <>Don&apos;t have an account? <button type="button" onClick={() => { setMode('register'); setError(''); }}>Register</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          )}
        </div>

        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/" className="back-link" style={{ marginBottom: 0 }}>← Back to gallery</Link>
        </p>
      </div>
    </div>
  );
}
