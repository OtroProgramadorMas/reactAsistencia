// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  CssBaseline, 
  Card, 
  CardContent,
  Grid,
  Paper} from '@mui/material';
import { 
  PersonOutline as UserIcon,
  MenuBook as BookIcon,
  GroupOutlined as GroupIcon,
  AssignmentOutlined as AssignmentIcon,
  BarChartOutlined as ChartIcon,
  ArrowForward as ArrowForwardIcon,
  School as SchoolIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate(); 
  // Estado para mostrar/ocultar información adicional
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  
  // Estado para las tarjetas que se voltean
  const [flippedCards, setFlippedCards] = useState({
    1: false,
    2: false,
    3: false
  });
  
  
  // Función para voltear una tarjeta
  const flipCard = (id: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Características/Roles
  const roles = [
    {
      id: 1,
      title: "Aprendices",
      icon: <SchoolIcon fontSize="large" />,
      description: "Visualiza tu historial de asistencias, recibe notificaciones y mantente al día con tus cursos.",
      color: "#2196f3",
      bgColor: "#e3f2fd",
      detailedInfo: "Como aprendiz, podrás consultar tu registro histórico de asistencias, ver estadísticas de tu participación en clase, recibir alertas de inasistencias y estar al tanto de tus horarios actualizados."
    },
    {
      id: 2,
      title: "Instructores",
      icon: <AssignmentIcon fontSize="large" />,
      description: "Registra asistencias fácilmente, genera reportes y comunícate con tus aprendices.",
      color: "#4caf50",
      bgColor: "#e8f5e9",
      detailedInfo: "Como instructor, podrás tomar asistencia digital de forma rápida, generar informes automáticos, comunicarte con tus aprendices por notificaciones y gestionar justificaciones de inasistencias."
    },
    {
      id: 3,
      title: "Administrativos",
      icon: <GroupIcon fontSize="large" />,
      description: "Gestiona usuarios, fichas, programas y supervisa todo el sistema de formación.",
      color: "#f44336",
      bgColor: "#ffebee",
      detailedInfo: "Como administrativo, podrás crear y gestionar fichas de formación, asignar instructores, generar reportes globales, administrar permisos de usuarios y supervisar el funcionamiento general del sistema."
    }
  ];
  
  // Estadísticas
  const stats = [
    { label: "Aprendices Activos", value: "2,500+", icon: <UserIcon style={{ color: "#2196f3" }} /> },
    { label: "Instructores", value: "120+", icon: <BookIcon style={{ color: "#4caf50" }} /> },
    { label: "Fichas de Formación", value: "65", icon: <AssignmentIcon style={{ color: "#2196f3" }} /> },
    { label: "Asistencias Diarias", value: "780", icon: <ChartIcon style={{ color: "#f44336" }} /> }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Navbar azul */}
      <AppBar position="static" sx={{ bgcolor: '#003D5B' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            EduPlatForm
          </Typography>
          
          <Button 
            variant="contained" 
            color="inherit" 
            startIcon={<LoginIcon />}
            onClick={() => navigate('/login')}
            sx={{ 
              color: '#003D5B',
              borderRadius: '20px'
            }}
          >
            Iniciar Sesión
          </Button>
        </Toolbar>
      </AppBar>
      
      {/* Sección Hero */}
      <Container maxWidth="md" sx={{ mt: 5, mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2, color: '#003D5B' }}>
          Sistema Integrado de Control de Asistencia
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Plataforma avanzada para el registro y seguimiento de asistencias en el SENA. 
          Diseñada para aprendices, instructores y personal administrativo.
        </Typography>
        
        <Button 
          variant="contained" 
          endIcon={<ArrowForwardIcon />}
          onClick={() => setShowMoreInfo(!showMoreInfo)}
          sx={{ 
            bgcolor: '#003D5B',
            borderRadius: '20px',
            mb: 3
          }}
        >
          {showMoreInfo ? 'Ocultar información' : 'Conocer más'}
        </Button>
        
        {/* Información adicional que aparece al hacer clic */}
        {showMoreInfo && (
          <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#003D5B' }}>
              Acerca de nuestro sistema
            </Typography>
            <Typography paragraph>
              El Sistema Integrado de Control de Asistencia es una plataforma digital desarrollada 
              específicamente para el SENA que permite gestionar de manera eficiente la asistencia 
              de los aprendices a sus sesiones de formación.
            </Typography>
            <Typography paragraph>
              Nuestra plataforma ofrece una solución completa para los tres roles principales 
              involucrados en el proceso formativo: aprendices, instructores y personal administrativo. 
              Cada rol cuenta con funcionalidades específicas diseñadas para optimizar sus tareas diarias.
            </Typography>
            <Typography>
              Desarrollada con las más recientes tecnologías web, garantiza un funcionamiento 
              rápido, seguro y adaptable a cualquier dispositivo, facilitando su uso tanto en 
              computadoras como en dispositivos móviles.
            </Typography>
          </Paper>
        )}
      </Container>
      
      {/* Estadísticas */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Paper elevation={2} sx={{ borderRadius: 2, py: 3 }}>
          <Grid container spacing={2}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      bgcolor: 'grey.100',
                      mb: 1
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
      
      {/* Sección de roles */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
          Una plataforma para todos los roles
        </Typography>
        
        <Grid container spacing={4}>
          {roles.map((role) => (
            <Grid item xs={12} md={4} key={role.id}>
              <Box 
                sx={{ 
                  height: '320px', 
                  perspective: '1000px',
                  '& .card-inner': {
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    transition: 'transform 0.6s',
                    transformStyle: 'preserve-3d',
                    transform: flippedCards[role.id] ? 'rotateY(180deg)' : ''
                  },
                  '& .card-front, & .card-back': {
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    borderRadius: 2
                  },
                  '& .card-back': {
                    transform: 'rotateY(180deg)'
                  }
                }}
              >
                <Box className="card-inner">
                  {/* Frente de la tarjeta */}
                  <Card className="card-front" sx={{ height: '100%' }}>
                    <Box sx={{ height: '8px', bgcolor: role.color }} />
                    <CardContent sx={{ p: 3, height: 'calc(100% - 8px)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                          sx={{ 
                            bgcolor: role.bgColor, 
                            p: 1.5, 
                            borderRadius: '50%',
                            mr: 2,
                            color: role.color
                          }}
                        >
                          {role.icon}
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                          {role.title}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {role.description}
                      </Typography>
                      
                      <Button 
                        variant="text" 
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => flipCard(role.id)}
                        sx={{ 
                          mt: 'auto', 
                          color: role.color,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        Más detalles
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Reverso de la tarjeta */}
                  <Card 
                    className="card-back" 
                    sx={{ 
                      height: '100%',
                      bgcolor: role.color,
                      color: 'white'
                    }}
                  >
                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Typography variant="h5" sx={{ mb: 2 }}>
                        Detalles de {role.title}
                      </Typography>
                      
                      <Typography variant="body1" sx={{ mb: 3 }}>
                        {role.detailedInfo}
                      </Typography>
                      
                      <Button 
                        variant="outlined" 
                        onClick={() => flipCard(role.id)}
                        sx={{ 
                          mt: 'auto',
                          color: 'white',
                          borderColor: 'white',
                          alignSelf: 'flex-start',
                          '&:hover': {
                            bgcolor: 'white',
                            color: role.color,
                            borderColor: 'white'
                          }
                        }}
                      >
                        Volver
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Call to Action */}
      <Box sx={{ bgcolor: '#003D5B', color: 'white', py: 4, mt: 4 }}>
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                ¿Listo para empezar?
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Accede ahora y descubre las funcionalidades disponibles según tu rol.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button 
                variant="contained" 
                color="inherit" 
                onClick={() => navigate('/login')}
                sx={{ 
                  borderRadius: '20px',
                  px: 3,
                  py: 1.5,
                  color: '#003D5B',
                  fontWeight: 'medium'
                }}
              >
                Iniciar sesión
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          mt: 'auto',
          py: 3,
          bgcolor: '#f5f5f5'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <SchoolIcon sx={{ color: '#003D5B', mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              SENA Asistencia
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Sistema Integrado de Control de Asistencia. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;