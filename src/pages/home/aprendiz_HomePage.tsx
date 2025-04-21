import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Card, 
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Button,
  Tabs,
  Tab,
  IconButton,
  Paper
} from '@mui/material';
import { 
  School as SchoolIcon, 
  CalendarToday as CalendarIcon, 
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ExitToApp as ExitToAppIcon,
  DashboardCustomize as DashboardIcon,
  HelpOutline as HelpOutlineIcon,
  Close as CloseIcon,
  ArrowRightAlt as ArrowRightAltIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FichaPaper from '../../components/shared/paper_ficha';
import FuncionarioCard from '../../components/shared/paper_funcionario';

interface AprendizData {
  idAprendiz: number;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  ficha: string;
  fichaId: number;
  programa: string;
}

interface AsistenciaData {
  idasistencia: number;
  fecha_asistencia: string;
  nombre_tipo_asistencia: string;
  idaprendiz: number;
  nombres_aprendiz: string;
  apellidos_aprendiz: string;
  nombre_programa: string;
}

// Componente TabPanel para mostrar contenido de pestañas
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{ padding: '24px 0' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const AprendizHomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aprendizData, setAprendizData] = useState<AprendizData | null>(null);
  const [asistencias, setAsistencias] = useState<AsistenciaData[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener el ID del localStorage
        const id = localStorage.getItem('id');
        const token = localStorage.getItem('token');
        
        if (!id || !token) {
          setError('No se encontró información de autenticación');
          setLoading(false);
          return;
        }
        
        // Hacer las peticiones al servidor en paralelo
        const [aprendizResponse, asistenciasResponse] = await Promise.all([
          fetch(`http://localhost:8000/aprendiz/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch(`http://localhost:8000/asistencia/aprendiz/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
        ]);
        
        // Procesar respuesta del aprendiz
        if (aprendizResponse.ok) {
          const aprendizResData = await aprendizResponse.json();
          const aprendizFromServer = aprendizResData.aprendiz || aprendizResData;
          
          // Mapear los datos del servidor al formato esperado por el componente
          setAprendizData({
            idAprendiz: aprendizFromServer.idaprendiz,
            documento: aprendizFromServer.documento_aprendiz,
            nombres: aprendizFromServer.nombres_aprendiz,
            apellidos: aprendizFromServer.apellidos_aprendiz,
            email: aprendizFromServer.email_aprendiz,
            telefono: aprendizFromServer.telefono_aprendiz?.toString() || '',
            ficha: aprendizFromServer.codigo_ficha?.toString() || '',
            fichaId: aprendizFromServer.ficha_idficha || 0,
            programa: aprendizFromServer.nombre_programa || ''
          });
        } else {
          const errorData = await aprendizResponse.json();
          setError(errorData.msg || 'Error al obtener datos del aprendiz');
        }
        
        // Procesar respuesta de asistencias
        if (asistenciasResponse.ok) {
          const asistenciasResData = await asistenciasResponse.json();
          setAsistencias(asistenciasResData.asistencias || []);
        } else {
          const errorData = await asistenciasResponse.json();
          console.error('Error al obtener asistencias:', errorData.msg);
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Manejador de cambio de tabs
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // Si el usuario selecciona la pestaña "Salir", cerramos sesión
    if (newValue === 2) {
      handleLogout();
    }
  };
  
  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Tutorial system functions
  const toggleTutorialMode = () => {
    setTutorialMode(!tutorialMode);
    setCurrentTutorialStep(0);
  };

  const handleNextTutorialStep = () => {
    if (currentTutorialStep < tutorialSteps.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    } else {
      setTutorialMode(false);
    }
  };

  const tutorialSteps = [
    {
      element: "header-card",
      title: "Panel de Aprendiz",
      description: "Bienvenido a tu panel personal. Aquí puedes ver tu información y gestionar tu asistencia.",
      position: { top: '20%', left: '50%' }
    },
    {
      element: "info-tab",
      title: "Pestañas de Navegación",
      description: "Utiliza estas pestañas para navegar entre las diferentes secciones de tu panel.",
      position: { top: '28%', left: '50%' }
    },
    {
      element: "info-personal",
      title: "Información Personal",
      description: "Aquí puedes ver todos tus datos personales registrados en el sistema.",
      position: { top: '45%', left: '25%' }
    },
    {
      element: "info-ficha",
      title: "Información de tu Ficha",
      description: "En esta sección encuentras los detalles de tu ficha de formación y programa.",
      position: { top: '45%', left: '50%' }
    },
    {
      element: "info-instructor",
      title: "Información del Instructor",
      description: "Aquí puedes ver los datos de contacto de tu instructor asignado.",
      position: { top: '45%', left: '75%' }
    },
    {
      element: "asistencia-tab",
      title: "Historial de Asistencias",
      description: "Haz clic en esta pestaña para ver tu registro completo de asistencias a las sesiones formativas.",
      position: { top: '28%', left: '50%' }
    },
    {
      element: "logout-tab",
      title: "Cerrar Sesión",
      description: "Cuando termines de usar el sistema, haz clic aquí para cerrar tu sesión de forma segura.",
      position: { top: '28%', left: '83%' }
    }
  ];
  
  // Mostrar estados de carga o error
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            {error}
          </Typography>
        </Box>
      </Container>
    );
  }
  
  // Formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Obtener color según tipo de asistencia
  const getAsistenciaColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'presente':
        return 'success';
      case 'ausente':
        return 'error';
      case 'tardanza':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  return (
    <Container maxWidth="lg">
      {/* Botón de tutorial flotante */}
      <Button
        variant="contained"
        startIcon={<HelpOutlineIcon />}
        onClick={toggleTutorialMode}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
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

      <Box sx={{ my: 4 }}>
        {/* Header con información básica */}
        <Card 
          id="header-card"
          sx={{ mb: 4, boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}
        >
          <Box 
            sx={{ 
              p: 3, 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="h5" gutterBottom>
                {aprendizData?.nombres} {aprendizData?.apellidos}
              </Typography>
              <Chip 
                icon={<SchoolIcon />} 
                label={`Ficha: ${aprendizData?.ficha}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mr: 1 }}
              />
              <Chip 
                icon={<DashboardIcon />} 
                label={aprendizData?.programa}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </Box>
          </Box>
        </Card>
        
        {/* Sistema de pestañas */}
        <Box sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="pestañas de navegación"
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab 
                id="info-tab"
                icon={<PersonIcon />} 
                label="Información" 
                aria-controls="tabpanel-0" 
              />
              <Tab 
                id="asistencia-tab"
                icon={<CalendarIcon />} 
                label="Asistencias" 
                aria-controls="tabpanel-1" 
              />
              <Tab 
                id="logout-tab"
                icon={<ExitToAppIcon />} 
                label="Cerrar Sesión" 
                aria-controls="tabpanel-2"
                sx={{ color: 'error.main' }} 
              />
            </Tabs>
          </Box>
          
          {/* Contenido de la pestaña "Información" */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Información del Aprendiz */}
              <Grid item xs={12} md={4}>
                <Card id="info-personal" sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6">
                      Información del Aprendiz
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Documento</Typography>
                        <Typography variant="body1">{aprendizData?.documento}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Email</Typography>
                        <Typography variant="body1">{aprendizData?.email}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary">Teléfono</Typography>
                        <Typography variant="body1">{aprendizData?.telefono || 'No registrado'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              
              {/* Información de la Ficha */}
              <Grid item xs={12} md={4}>
                <Box id="info-ficha" sx={{ height: '100%' }}>
                  {aprendizData && <FichaPaper fichaId={aprendizData.fichaId} />}
                </Box>
              </Grid>
              
              {/* Información del Funcionario */}
              <Grid item xs={12} md={4}>
                <Box id="info-instructor" sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
                  <FuncionarioCard />
                </Box>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Contenido de la pestaña "Asistencias" */}
          <TabPanel value={tabValue} index={1}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6">
                  Historial de Asistencias
                </Typography>
              </Box>
              
              <Box sx={{ p: 2 }}>
                {asistencias.length > 0 ? (
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table stickyHeader aria-label="tabla de asistencias">
                      <TableHead>
                        <TableRow>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Programa</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {asistencias.map((asistencia) => (
                          <TableRow key={asistencia.idasistencia}>
                            <TableCell>{formatDate(asistencia.fecha_asistencia)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={asistencia.nombre_tipo_asistencia}
                                color={getAsistenciaColor(asistencia.nombre_tipo_asistencia)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{asistencia.nombre_programa}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      No hay registros de asistencia disponibles
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </TabPanel>
          
          {/* No necesitamos contenido para la pestaña "Cerrar Sesión" porque se ejecuta automáticamente */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          </TabPanel>
        </Box>
      </Box>

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
            onClick={() => setTutorialMode(false)}
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
    </Container>
  );
};

export default AprendizHomePage;