import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, JSX } from 'react';
import HomePage from './pages/homePage';
import LoginPage from './pages/loginPage';
import NotFoundPage from './pages/notFoundPage';
import AprendizPage from './pages/home/aprendiz_HomePage';
import InstructorHomePage from './pages/home/instructor_HomePage';
import AdministradorHomePage from './pages/home/admin_HomePage';

function AuthGuard({ children }: { children: JSX.Element }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem('token'));
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Redirigir a login si no está autenticado (excepto en HomePage)
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/') {
    return <Navigate to="/login" replace />;
  }

  // Redirigir a la página principal si ya está autenticado y está en /login
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* HomePage ahora es pública */}
        <Route path="/" element={<HomePage />} />
        
        {/* LoginPage sigue siendo accesible sin autenticación */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/aprendiz"
          element={
            <AuthGuard>
              <AprendizPage />
            </AuthGuard>
          }
        />
        <Route
          path="/instructor"
          element={
            <AuthGuard>
              <InstructorHomePage />
            </AuthGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdministradorHomePage />
            </AuthGuard>
          }
        />

        {/* Página no encontrada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
