// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Container, Typography, Button, Box, Modal } from '@mui/material';
import LoginAprendiz from '../components/LoginAprendiz';
import LoginFuncionario from '../components/LoginFuncionario';

const LoginPage = () => {
  const [openAprendiz, setOpenAprendiz] = useState(false);
  const [openFuncionario, setOpenFuncionario] = useState(false);

  const handleOpenAprendiz = () => setOpenAprendiz(true);
  const handleCloseAprendiz = () => setOpenAprendiz(false);

  const handleOpenFuncionario = () => setOpenFuncionario(true);
  const handleCloseFuncionario = () => setOpenFuncionario(false);

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Iniciar Sesión
        </Typography>
        <Typography variant="body1" paragraph>
          Selecciona tu tipo de usuario para continuar.
        </Typography>

        {/* Botón para abrir el modal de Aprendiz */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleOpenAprendiz}
        >
          Iniciar Sesión como Aprendiz
        </Button>

        {/* Botón para abrir el modal de Funcionario */}
        <Button
          variant="contained"
          color="secondary"
          size="large"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleOpenFuncionario}
        >
          Iniciar Sesión como Funcionario
        </Button>
      </Box>

      {/* Modal para Login Aprendiz */}
      <Modal open={openAprendiz} onClose={handleCloseAprendiz}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, width: 400 }}>
          <LoginAprendiz onClose={handleCloseAprendiz} />
        </Box>
      </Modal>

      {/* Modal para Login Funcionario */}
      <Modal open={openFuncionario} onClose={handleCloseFuncionario}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 4, width: 400 }}>
          <LoginFuncionario onClose={handleCloseFuncionario} />
        </Box>
      </Modal>
    </Container>
  );
};

export default LoginPage;