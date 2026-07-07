import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireArtist = false }) {
  const { user, isArtist } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireArtist && !isArtist) {
    return <Navigate to="/" replace />;
  }

  return children;
}
