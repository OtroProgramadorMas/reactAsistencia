// src/components/LoginAprendiz.tsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginAprendiz = ({ onClose }: { onClose: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
          
          // // Opcional: Guardar más información del usuario si lo necesitas
          // localStorage.setItem("userData", JSON.stringify({
          //   id: data.user.id,
          //   nombre: data.user.nombre || `${data.user.nombres || ''} ${data.user.apellidos || ''}`,
          //   email: data.user.email,
          //   tipo: 'aprendiz'
          // }));
          
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Iniciar Sesión como Aprendiz
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Correo electrónico"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
        </Button>
      </form>
    </Box>
  );
};

export default LoginAprendiz;