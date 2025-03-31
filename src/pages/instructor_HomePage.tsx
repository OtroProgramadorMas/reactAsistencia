// src/pages/AprendizPage.tsx
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const InstructorHomePage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          ¡Bienvenido Instructor!
        </Typography>
        <Typography variant="body1" paragraph>
          Estamos emocionados de tenerte aquí. Explora todas las funcionalidades disponibles para ti.
        </Typography>
      </Box>
    </Container>
  );
};

export default InstructorHomePage;