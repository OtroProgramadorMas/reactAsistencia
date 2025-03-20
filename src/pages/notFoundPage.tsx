// src/pages/NotFoundPage.tsx
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold', fontSize: '6rem', color: 'error.main' }}>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        ¡Oops! Página no encontrada
      </Typography>
      <Typography variant="body1" paragraph>
        La página que estás buscando no existe o ha sido movida.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/')} // Redirige a la página principal
        >
          Volver al inicio
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;