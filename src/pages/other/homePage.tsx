// src/pages/HomePage.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, CssBaseline } from '@mui/material';
import { Login } from '@mui/icons-material'; // Ícono de login
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const HomePage = () => {
  const navigate = useNavigate(); // Inicializa el hook

  return (
    <>
      {/* Aplica un reset de estilos y normaliza el comportamiento en todos los navegadores */}
      <CssBaseline />

      {/* Navbar */}
      <AppBar position="static">
        <Toolbar>
          {/* Título del proyecto */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mi Proyecto
          </Typography>

          {/* Botón de Login */}
          <Button
            color="inherit"
            startIcon={<Login />}
            onClick={() => navigate('/login')} // Redirige a /login al hacer clic
          >
            Login
          </Button>
        </Toolbar>
      </AppBar>

      {/* Contenido principal de la página */}
      <Container>
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Bienvenido a Mi Proyecto
          </Typography>
          <Typography variant="body1" paragraph>
            Esta es una página de presentación para mostrar las características y funcionalidades de nuestro proyecto.
          </Typography>
          <Typography variant="body1" paragraph>
            ¡Explora y descubre todo lo que podemos ofrecer!
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;