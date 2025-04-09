// src/pages/AprendizPage.tsx
import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Card, 
  CardActionArea, 
  Avatar, 
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid
} from '@mui/material';
import { 
  School as SchoolIcon, 
  CalendarToday as CalendarIcon, 
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import Navbar from '../components/shared/navbar';

interface AprendizData {
  idAprendiz: number;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgAprendiz: string | null;
  ficha: string;
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

const AprendizHomePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aprendizData, setAprendizData] = useState<AprendizData | null>(null);
  const [asistencias, setAsistencias] = useState<AsistenciaData[]>([]);
  const [flipped, setFlipped] = useState(false);
  
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
            url_imgAprendiz: null, // No hay URL de imagen en el servidor
            ficha: aprendizFromServer.codigo_ficha?.toString() || '',
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
  
  const handleFlip = () => {
    setFlipped(!flipped);
  };
  
  // Mostrar estados de carga o error
  if (loading) {
    return (
      <>
        <Navbar userType="aprendiz" userName="" />
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navbar userType="aprendiz" userName="" />
        <Container maxWidth="md">
          <Box sx={{ my: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error">
              {error}
            </Typography>
          </Box>
        </Container>
      </>
    );
  }
  
  // Formatear la fecha para mostrar solo los últimos 10 registros
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
      case 'asistió':
        return 'success';
      case 'falta':
        return 'error';
      case 'excusa':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  // Mostrar datos del aprendiz
  return (
    <>
      <Navbar userType="aprendiz" userName={`${aprendizData?.nombres || ''} ${aprendizData?.apellidos || ''}`} />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Panel de Aprendiz
          </Typography>
          
          <Box 
            sx={{ 
              perspective: '1000px',
              height: '450px',
              mt: 3,
              position: 'relative'
            }}
          >
            {/* Card que se voltea */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.8s',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
              }}
            >
              {/* Parte frontal de la tarjeta - Información del aprendiz */}
              <Card
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}
              >
                <CardActionArea 
                  onClick={handleFlip}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'stretch',
                    height: '100%' 
                  }}
                >
                  <Box 
                    sx={{ 
                      width: { xs: '100%', md: '40%' }, 
                      bgcolor: 'primary.main',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4,
                      color: 'white'
                    }}
                  >
                    <Avatar 
                      src={aprendizData?.url_imgAprendiz || undefined} 
                      sx={{ 
                        width: 150, 
                        height: 150, 
                        mb: 3,
                        border: '4px solid white'
                      }}
                    >
                      {aprendizData?.nombres?.charAt(0) || 'A'}
                    </Avatar>
                    <Typography variant="h4" component="h2" gutterBottom align="center">
                      {aprendizData?.nombres} {aprendizData?.apellidos}
                    </Typography>
                    <Chip 
                      icon={<SchoolIcon />} 
                      label={`Ficha: ${aprendizData?.ficha}`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 1 }}
                    />
                  </Box>
                  
                  <Box 
                    sx={{ 
                      width: { xs: '100%', md: '60%' }, 
                      p: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h5" gutterBottom color="primary">
                      Información Personal
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="caption" color="textSecondary">Documento</Typography>
                            <Typography variant="body1">{aprendizData?.documento}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="caption" color="textSecondary">Email</Typography>
                            <Typography variant="body1">{aprendizData?.email}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="caption" color="textSecondary">Teléfono</Typography>
                            <Typography variant="body1">{aprendizData?.telefono || 'No registrado'}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="caption" color="textSecondary">Programa</Typography>
                            <Typography variant="body1">{aprendizData?.programa}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        <CalendarIcon sx={{ fontSize: 'small', mr: 0.5, verticalAlign: 'middle' }} />
                        Última asistencia: {asistencias.length > 0 ? formatDate(asistencias[0].fecha_asistencia) : 'Sin registros'}
                      </Typography>
                      
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                        Haz clic para ver tu historial de asistencias →
                      </Typography>
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
              
              {/* Parte trasera de la tarjeta - Historial de asistencias */}
              <Card
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}
              >
                <CardActionArea 
                  onClick={handleFlip}
                  sx={{ height: '100%', p: 0 }}
                >
                  <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h5" component="h2">
                      Historial de Asistencias
                    </Typography>
                    <Typography variant="body2">
                      {aprendizData?.nombres} {aprendizData?.apellidos} - Ficha {aprendizData?.ficha}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ height: 'calc(100% - 84px)', overflow: 'auto', p: 2 }}>
                    {asistencias.length > 0 ? (
                      <TableContainer>
                        <Table aria-label="tabla de asistencias">
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
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        height: '100%'
                      }}>
                        <Typography variant="body1" color="textSecondary">
                          No hay registros de asistencia disponibles
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ 
                    p: 2, 
                    borderTop: '1px solid rgba(0,0,0,0.1)', 
                    display: 'flex', 
                    justifyContent: 'flex-end' 
                  }}>
                    <Typography variant="body2" color="primary">
                      ← Volver a información del aprendiz
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default AprendizHomePage;