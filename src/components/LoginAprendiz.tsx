// src/components/LoginAprendiz.tsx
import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';

const LoginAprendiz = ({ onClose }: { onClose: () => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de autenticación para aprendiz
    console.log('Login Aprendiz');
    onClose(); // Cierra el modal después del login
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Iniciar Sesión como Aprendiz
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Correo electrónico"
          variant="outlined"
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Contraseña"
          type="password"
          variant="outlined"
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Iniciar Sesión
        </Button>
      </form>
    </Box>
  );
};

export default LoginAprendiz;