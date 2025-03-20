// src/components/LoginFuncionario.tsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const LoginFuncionario = ({ onClose }: { onClose: () => void }) => {
  const [rol, setRol] = useState('instructor'); // Estado para el rol seleccionado
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de autenticación para funcionario
    console.log(`Login Funcionario como ${rol} con email: ${email}`);
    onClose(); // Cierra el modal después del login
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Iniciar Sesión como Funcionario
      </Typography>
      <form onSubmit={handleSubmit}>
        {/* Campo para seleccionar el rol */}
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

        {/* Campo para el correo electrónico */}
        <TextField
          fullWidth
          label="Correo electrónico"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Campo para la contraseña */}
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

        {/* Botón para enviar el formulario */}
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Iniciar Sesión
        </Button>
      </form>
    </Box>
  );
};

export default LoginFuncionario;