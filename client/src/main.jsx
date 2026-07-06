import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Browse from './pages/Browse.jsx';
import Upload from './pages/Upload.jsx';
import Auth from './pages/Auth.jsx';
import MyPurchases from './pages/MyPurchases.jsx';
import MyUploads from './pages/MyUploads.jsx';
import { AuthProvider, useAuth } from './AuthContext.jsx';

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Link to="/">Browse</Link>
      <Link to="/upload">Upload artwork</Link>
      {user && user.role === 'artist' && <Link to="/my-uploads">My Uploads</Link>}
      {user && <Link to="/my-purchases">My Purchases</Link>}
      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <>
            <span style={{ marginRight: '1rem' }}>Hi, {user.fullName} ({user.role})</span>
            <button onClick={logout}>Log out</button>
          </>
        ) : (
          <Link to="/login">Log in / Register</Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route path="/my-uploads" element={<MyUploads />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);