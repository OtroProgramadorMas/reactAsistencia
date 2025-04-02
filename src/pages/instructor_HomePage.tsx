// src/pages/AprendizPage.tsx
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Navbar from '../components/shared/navbar';

const InstructorHomePage = () => {
  // datos del localStorage
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  return (
    <>
      <Navbar userType="aprendiz" userName={userData.nombre} />
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            ¡Bienvenido Instructor!
          </Typography>
          <Typography variant="body1" paragraph>
            Estamos emocionados de tenerte aquí. Explora todas las funcionalidades disponibles para ti.
          </Typography>
        </Box>
      </Container></>
  );
};

export default InstructorHomePage;