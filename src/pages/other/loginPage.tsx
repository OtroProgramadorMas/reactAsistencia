import React, { useState } from 'react';
import { Container, Typography, Box, Modal, Paper, Fade, Button, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import LoginAprendiz from '../../components/LoginAprendiz';
import LoginFuncionario from '../../components/LoginFuncionario';
import RecuperarPassword from '../../components/RecuperarPassword';

import imgAprendiz from './../../../src/assets/loginLogos/aprendiz.avif';
import imgInstructor from './../../../src/assets/loginLogos/instructor.jpg';
import imgBackground from './../../../src/assets/loginLogos/fondoSena.jpeg';

const LoginPage = () => {
  const [openAprendiz, setOpenAprendiz] = useState(false);
  const [openFuncionario, setOpenFuncionario] = useState(false);
  const [openRecuperarPassword, setOpenRecuperarPassword] = useState(false);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  const handleOpenAprendiz = () => setOpenAprendiz(true);
  const handleCloseAprendiz = () => setOpenAprendiz(false);

  const handleOpenFuncionario = () => setOpenFuncionario(true);
  const handleCloseFuncionario = () => setOpenFuncionario(false);

  const handleOpenRecuperarPassword = () => setOpenRecuperarPassword(true);
  const handleCloseRecuperarPassword = () => setOpenRecuperarPassword(false);

  const toggleTutorialMode = () => {
    setTutorialMode(!tutorialMode);
    setCurrentTutorialStep(0);
  };

  const tutorialSteps = [
    {
      element: "title",
      title: "Página de Inicio de Sesión",
      description: "Esta es la página principal donde puedes acceder al sistema según tu tipo de usuario.",
      position: { top: '15%', left: '50%' }
    },
    {
      element: "aprendizCard",
      title: "Acceso para Aprendices",
      description: "Haz clic aquí si eres estudiante para acceder a tu portal de aprendizaje.",
      position: { top: '30%', left: '35%' }
    },
    {
      element: "funcionarioCard",
      title: "Acceso para Funcionarios",
      description: "Haz clic aquí si eres instructor o personal administrativo para acceder al sistema.",
      position: { top: '30%', left: '65%' }
    },
    {
      element: "recuperarPassword",
      title: "Recuperar Contraseña",
      description: "Si olvidaste tu contraseña, haz clic aquí para restablecerla.",
      position: { bottom: '8%', left: '50%' }
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
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: `url(${imgBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0, 
        margin: 0, 
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Botón de tutorial en la parte inferior */}
      <Button
        variant="contained"
        startIcon={<HelpOutlineIcon />}
        onClick={toggleTutorialMode}
        sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: 20,
          py: 1,
          px: 3,
          backgroundColor: '#1a237e',
          color: 'white',
          '&:hover': {
            backgroundColor: '#0d1642',
          },
          zIndex: 1100
        }}
      >
        {tutorialMode ? 'Cerrar Tutorial' : 'Tutorial'}
      </Button>

      <Container maxWidth="md" sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        zIndex: tutorialMode ? 1 : 1050,
      }}>
        <Paper
          elevation={10}
          sx={{
            py: 5,
            px: { xs: 2, md: 6 },
            borderRadius: 4,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(245,247,250,0.9) 100%)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              left: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.1) 100%)',
              zIndex: 0
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -80,
              right: -80,
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, rgba(220,20,60,0.1) 0%, rgba(220,20,60,0.05) 100%)',
              zIndex: 0
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              id="title"
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                textAlign: 'center',
                background: 'linear-gradient(45deg, #1a237e 30%, #b71c1c 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Iniciar Sesión
            </Typography>

            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                mb: 5,
                color: 'text.secondary',
                fontWeight: 400
              }}
            >
              Selecciona tu tipo de usuario para continuar
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4,
                justifyContent: 'center',
                alignItems: 'center',
                mt: 2
              }}
            >
              {/* Card para Aprendiz */}
              <Paper
                id="aprendizCard"
                elevation={4}
                sx={{
                  width: { xs: '90%', sm: 280 },
                  height: 320,
                  borderRadius: 4,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    '& .overlay': {
                      opacity: 0.7
                    },
                    '& .title': {
                      transform: 'translateY(-10px)'
                    }
                  }
                }}
                onClick={handleOpenAprendiz}
              >
                <Box
                  component="img"
                  src={imgAprendiz}
                  alt="Iniciar Sesión como Aprendiz"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(25,25,112,0.9) 0%, rgba(25,25,112,0.2) 100%)',
                    opacity: 0.5,
                    transition: 'opacity 0.3s ease'
                  }}
                />
                <Box
                  className="title"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 3,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 700 }}>
                    Aprendiz
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, mt: 1 }}>
                    Accede a tu portal de estudiante
                  </Typography>
                </Box>
              </Paper>

              {/* Card para Funcionario */}
              <Paper
                id="funcionarioCard"
                elevation={4}
                sx={{
                  width: { xs: '90%', sm: 280 },
                  height: 320,
                  borderRadius: 4,
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    '& .overlay': {
                      opacity: 0.7
                    },
                    '& .title': {
                      transform: 'translateY(-10px)'
                    }
                  }
                }}
                onClick={handleOpenFuncionario}
              >
                <Box
                  component="img"
                  src={imgInstructor}
                  alt="Iniciar Sesión como Funcionario"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to top, rgba(178,34,34,0.9) 0%, rgba(178,34,34,0.2) 100%)',
                    opacity: 0.5,
                    transition: 'opacity 0.3s ease'
                  }}
                />
                <Box
                  className="title"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 3,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 700 }}>
                    Funcionario
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, mt: 1 }}>
                    Accede al sistema administrativo
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* Botón de recuperar contraseña */}
            <Box id="recuperarPassword" sx={{ textAlign: 'center', mt: 4 }}>
              <Typography
                variant="body2"
                component="button"
                onClick={handleOpenRecuperarPassword}
                sx={{
                  background: 'none',
                  border: 'none',
                  color: '#1a237e',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#b71c1c',
                  }
                }}
              >
                ¿Olvidaste tu contraseña?
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Modal para Login Aprendiz */}
        <Modal
          open={openAprendiz}
          onClose={handleCloseAprendiz}
          closeAfterTransition
        >
          <Fade in={openAprendiz}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              width: { xs: '90%', sm: 400 },
              maxWidth: '100%',
              borderRadius: 2
            }}>
              <LoginAprendiz onClose={handleCloseAprendiz} />
            </Box>
          </Fade>
        </Modal>

        {/* Modal para Login Funcionario */}
        <Modal
          open={openFuncionario}
          onClose={handleCloseFuncionario}
          closeAfterTransition
        >
          <Fade in={openFuncionario}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              width: { xs: '90%', sm: 400 },
              maxWidth: '100%',
              borderRadius: 2
            }}>
              <LoginFuncionario onClose={handleCloseFuncionario} />
            </Box>
          </Fade>
        </Modal>

        {/* Modal para Recuperar Contraseña */}
        <Modal
          open={openRecuperarPassword}
          onClose={handleCloseRecuperarPassword}
          closeAfterTransition
        >
          <Fade in={openRecuperarPassword}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              width: { xs: '90%', sm: 400 },
              maxWidth: '100%',
              borderRadius: 2
            }}>
              <RecuperarPassword onClose={handleCloseRecuperarPassword} />
            </Box>
          </Fade>
        </Modal>
      </Container>

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

export default LoginPage;