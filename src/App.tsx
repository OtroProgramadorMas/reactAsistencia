// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import HomePage from './pages/homePage';
import LoginPage from './pages/loginPage';
import NotFoundPage from './pages/notFoundPage';
import AprendizPage from './pages/aprendiz_HomePage';
import InstructorHomePage from './pages/instructor_HomePage';
import AdministradorHomePage from './pages/admin_HomePage';
import React from 'react';
import { JSX } from '@emotion/react/jsx-runtime';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem("token"));
  const location = useLocation();

  // Monitorear cambios en el localStorage
  React.useEffect(() => {
    const checkAuth = () => setIsAuthenticated(!!localStorage.getItem("token"));
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Lista de rutas protegidas (requieren autenticación)
  const protectedRoutes = ['/aprendiz', '/instructor', '/admin', '/dashboard'];
  const isProtectedRoute = protectedRoutes.includes(location.pathname);

  // Lógica de redirección
  if (!isAuthenticated && isProtectedRoute) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && location.pathname === "/login") {
    return <Navigate to="/dashboard" replace />; // O a la ruta según rol
  }

  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<HomePage />} />
        
        {/* Ruta de login (accesible solo sin autenticación) */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} 
        />
        
        {/* Rutas protegidas */}
        <Route path='/aprendiz' element={
          <ProtectedRoute allowedRoles={['aprendiz']}>
            <AprendizPage />
          </ProtectedRoute>
        } />
        
        <Route path='/instructor' element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorHomePage />
          </ProtectedRoute>
        } />
        
        <Route path='/admin' element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdministradorHomePage />
          </ProtectedRoute>
        } />
        
        {/* Ruta para páginas no encontradas */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

// Componente para protección de rutas con roles
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const userDataString = localStorage.getItem("userData") || '{}';
  const userData = JSON.parse(userDataString);
  const userRole = userData.role || 'guest';
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

export default App;