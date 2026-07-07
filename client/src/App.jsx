import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ArtworkDetail from './pages/ArtworkDetail';
import Auth from './pages/Auth';
import Upload from './pages/Upload';
import MyUploads from './pages/MyUploads';
import MyPurchases from './pages/MyPurchases';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="artwork/:id" element={<ArtworkDetail />} />
            <Route path="login" element={<Auth />} />
            <Route
              path="upload"
              element={
                <ProtectedRoute requireArtist>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-uploads"
              element={
                <ProtectedRoute requireArtist>
                  <MyUploads />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-purchases"
              element={
                <ProtectedRoute>
                  <MyPurchases />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
