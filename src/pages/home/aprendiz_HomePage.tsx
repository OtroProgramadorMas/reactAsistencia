// src/pages/AprendizPage.tsx
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
  Tab
} from '@mui/material';
import { 
  School as SchoolIcon, 
  CalendarToday as CalendarIcon, 
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ExitToApp as ExitToAppIcon,
  DashboardCustomize as DashboardIcon
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
      case 'Presente':
        return 'success';
      case 'Ausente':
        return 'error';
      case 'Tardanza':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Header con información básica */}
        <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
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
                icon={<PersonIcon />} 
                label="Información" 
                id="tab-0" 
                aria-controls="tabpanel-0" 
              />
              <Tab 
                icon={<CalendarIcon />} 
                label="Asistencias" 
                id="tab-1" 
                aria-controls="tabpanel-1" 
              />
              <Tab 
                icon={<ExitToAppIcon />} 
                label="Cerrar Sesión" 
                id="tab-2" 
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
                <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2 }}>
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
                <Box sx={{ height: '100%' }}>
                  {aprendizData && <FichaPaper fichaId={aprendizData.fichaId} />}
                </Box>
              </Grid>
              
              {/* Información del Funcionario */}
              <Grid item xs={12} md={4}>
                <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
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
    </Container>
  );
};

export default AprendizHomePage;