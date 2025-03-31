// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/homePage';
import LoginPage from './pages/loginPage'; // Crea esta página para el login
import NotFoundPage from './pages/notFoundPage'; // Opcional: Página para rutas no encontradas
import AprendizPage from './pages/aprendiz_HomePage';
import InstructorHomePage from './pages/instructor_HomePage';
import AdministradorHomePage from './pages/admin_HomePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para la página principal */}
        <Route path="/" element={<HomePage />} />

        {/* Ruta para la página de login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Ruta para páginas no encontradas (opcional) */}
        <Route path="*" element={<NotFoundPage />} />

        {/* Ruta para pagina principal de Aprendiz */}
        <Route path='/aprendiz' element={<AprendizPage />} />

        {/* Ruta para pagina principal de Instructor */}
        <Route path='/instructor' element={<InstructorHomePage />} />
        
        {/* Ruta para pagina principal de Administrador */}
        <Route path='/admin' element={<AdministradorHomePage />} />
        
      </Routes>
    </Router>
  );
  {/* Ruta para pagina principal de Aprendiz */ }
}

export default App;