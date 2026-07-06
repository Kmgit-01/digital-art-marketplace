import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Browse from './pages/Browse.jsx';
import Upload from './pages/Upload.jsx';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Browse</Link>
        <Link to="/upload">Upload artwork</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Browse />} />
        <Route path="/upload" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
