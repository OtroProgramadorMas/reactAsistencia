// src/components/LoginFuncionario.tsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginFuncionario = ({ onClose }: { onClose: () => void }) => {
  const [rol, setRol] = useState('instructor'); // Estado para el rol seleccionado
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Hacer la solicitud al servidor (misma URL pero con tipo diferente)
      const response = await fetch('http://localhost:8000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, tipo: rol }), // Usamos el rol seleccionado
      });

      const data = await response.json();

      if (response.ok) {
        // Redirigir según el tipo de usuario
        if (rol === 'instructor') {
          navigate('/instructor');
        } else if (rol === 'administrador') {
          navigate('/admin');
        }
        onClose(); // Cierra el modal después del login
      } else {
        setError(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error en el servidor');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Iniciar Sesión como Funcionario
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="rol-label">Rol</InputLabel>
          <Select
            labelId="rol-label"
            value={rol}
            label="Rol"
            onChange={(e) => setRol(e.target.value as string)}
          >
            <MenuItem value="instructor">Instructor</MenuItem>
            <MenuItem value="administrador">Administrador</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Correo electrónico"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
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
        />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Iniciar Sesión
        </Button>
      </form>
    </Box>
  );
};

export default LoginFuncionario;