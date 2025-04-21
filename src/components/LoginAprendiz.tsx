import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  IconButton,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';

const LoginAprendiz = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Hacer la solicitud al servidor
      const response = await fetch('http://localhost:8000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, tipo: 'aprendiz' }),
      });

      const data = await response.json();

      if (response.ok) {
        // Asegurarse de que los datos del usuario estén en el formato esperado
        if (data.user && data.token) {
          // Guardar ID y token en localStorage
          localStorage.setItem("id", data.user.id);
          localStorage.setItem("token", data.token);
          
          // Disparar evento para actualizar otros componentes que dependan del localStorage
          window.dispatchEvent(new Event("storage"));
          
          // Redirigir a la página del aprendiz
          navigate('/aprendiz');
          onClose(); // Cerrar el modal después del login exitoso
        } else {
          setError('Respuesta del servidor incompleta');
        }
      } else {
        // Si hay un error, mostrar el mensaje del servidor
        setError(data.msg || data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error en el servidor. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTutorialMode = () => {
    setTutorialMode(!tutorialMode);
    setCurrentTutorialStep(0);
  };

  const tutorialSteps = [
    {
      element: "title",
      title: "Inicio de Sesión para Aprendices",
      description: "Esta es la ventana donde puedes acceder al sistema con tus credenciales de estudiante.",
      position: { top: '15%', left: '50%' }
    },
    {
      element: "email",
      title: "Campo de Correo Electrónico",
      description: "Ingresa aquí el correo electrónico asociado a tu cuenta de aprendiz.",
      position: { top: '35%', left: '50%' }
    },
    {
      element: "password",
      title: "Campo de Contraseña",
      description: "Ingresa aquí tu contraseña personal para acceder al sistema.",
      position: { top: '50%', left: '50%' }
    },
    {
      element: "loginButton",
      title: "Botón de Inicio de Sesión",
      description: "Haz clic aquí después de ingresar tus credenciales para acceder a tu portal de aprendiz.",
      position: { top: '65%', left: '50%' }
    }
  ];

  const handleNextTutorialStep = () => {
    if (currentTutorialStep < tutorialSteps.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    } else {
      setTutorialMode(false);
    }
  };

  return (
    <Box sx={{ p: 2, position: 'relative' }}>
      {/* Botón de tutorial en la esquina superior derecha */}
      <IconButton 
        onClick={toggleTutorialMode}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          color: '#1a237e',
        }}
      >
        <HelpOutlineIcon />
      </IconButton>

      <Typography 
        id="title"
        variant="h5" 
        component="h2" 
        gutterBottom
        sx={{
          fontWeight: 600,
          color: '#1a237e',
          textAlign: 'center',
          mt: 1
        }}
      >
        Iniciar Sesión como Aprendiz
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <TextField
          id="email"
          fullWidth
          label="Correo electrónico"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#1a237e',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#1a237e',
            }
          }}
        />
        <TextField
          id="password"
          fullWidth
          label="Contraseña"
          type="password"
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#1a237e',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#1a237e',
            }
          }}
        />
        <Button 
          id="loginButton"
          type="submit"
          variant="contained"
          fullWidth
          sx={{ 
            mt: 2,
            backgroundColor: '#1a237e',
            '&:hover': {
              backgroundColor: '#0d1642',
            }
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
        </Button>
      </form>

      {/* Overlay Tutorial */}
      {tutorialMode && (
        <>
          {/* Capa oscura */}
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
            }}
            onClick={() => setTutorialMode(false)}
          />

          {/* Ventana de tutorial */}
          <Box
            sx={{
              position: 'fixed',
              ...tutorialSteps[currentTutorialStep].position,
              transform: 'translate(-50%, -50%)',
              zIndex: 1200,
              display: 'flex',
              flexDirection: 'column',
              maxWidth: 350,
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              p: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" fontWeight="bold" color="#1a237e">
                {tutorialSteps[currentTutorialStep].title}
              </Typography>
              <IconButton size="small" onClick={toggleTutorialMode}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
              {tutorialSteps[currentTutorialStep].description}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {`${currentTutorialStep + 1} de ${tutorialSteps.length}`}
              </Typography>

              <Button
                variant="contained"
                endIcon={<ArrowRightAltIcon />}
                onClick={handleNextTutorialStep}
                sx={{
                  backgroundColor: '#1a237e',
                  '&:hover': {
                    backgroundColor: '#0d1642',
                  },
                }}
              >
                {currentTutorialStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
              </Button>
            </Box>

            {/* Flecha apuntando al elemento */}
            <Box
              sx={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '15px solid white',
                bottom: -15,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default LoginAprendiz;