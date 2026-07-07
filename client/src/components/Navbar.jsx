import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isArtist } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo">ArtVault</Link>

        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>
            Explore
          </NavLink>
          {isArtist && (
            <>
              <NavLink to="/upload" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Upload
              </NavLink>
              <NavLink to="/my-uploads" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                My Uploads
              </NavLink>
            </>
          )}
          {user && (
            <NavLink to="/my-purchases" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              My Purchases
            </NavLink>
          )}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-badge">
                <strong>{user.fullName}</strong>
                <span className="role-tag">{user.role}</span>
              </span>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Log out</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
