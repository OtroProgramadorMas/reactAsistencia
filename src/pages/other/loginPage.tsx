// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { Container, Typography, Box, Modal, Paper, Fade } from '@mui/material';
import LoginAprendiz from '../../components/LoginAprendiz';
import LoginFuncionario from '../../components/LoginFuncionario';

import imgAprendiz from '../../assets/loginLogos/aprendiz.avif';
import imgInstructor from '../../assets/loginLogos/instructor.jpg';
import imgBackground from '../../assets/loginLogos/fondoSena.jpeg';

const LoginPage = () => {
  const [openAprendiz, setOpenAprendiz] = useState(false);
  const [openFuncionario, setOpenFuncionario] = useState(false);

  const handleOpenAprendiz = () => setOpenAprendiz(true);
  const handleCloseAprendiz = () => setOpenAprendiz(false);

  const handleOpenFuncionario = () => setOpenFuncionario(true);
  const handleCloseFuncionario = () => setOpenFuncionario(false);

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
        overflow: 'hidden' 
      }}
    >
      <Container maxWidth="md" sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
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
                  src={imgAprendiz} // Ahora usa la variable importada
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
                  src={imgInstructor} // Ahora usa la variable importada
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
      </Container>
    </Box>
  );
};

export default LoginPage;