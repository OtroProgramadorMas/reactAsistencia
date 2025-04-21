// src/pages/AprendizPage.tsx
import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Card, 
  Chip,
  Grid,
  Tabs,
  Tab,
  CardContent,
  Alert
} from '@mui/material';
import { 
  CalendarToday as CalendarIcon, 
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ExitToApp as ExitToAppIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FichaPaper from '../../components/shared/paper_ficha';
import FuncionarioCard from '../../components/shared/paper_funcionario';
import DinamicTable from '../../components/shared/dataTable';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

interface AprendizData {
  idAprendiz: number;
  documento: string;
  abreviaturaTipoDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  ficha: string;
  fichaId: number;
  programa: string;
}

interface FichaData {
  idficha: number;
  codigo_ficha: string;
  fecha_inicio: string;
  funcionario_idfuncionario: number;
  programa_idprograma: number;
  estado_ficha_idestado_ficha: number;
  idestado_ficha: number;
  estado_ficha: string;
  codigo_programa: string;
  nombre_programa: string;
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
  const [fichaData, setFichaData] = useState<FichaData | null>(null);
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
        
        // Hacer la petición para obtener datos del aprendiz
        const aprendizResponse = await fetch(`http://localhost:8000/aprendiz/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Procesar respuesta del aprendiz
        if (aprendizResponse.ok) {
          const aprendizResData = await aprendizResponse.json();
          const aprendizFromServer = aprendizResData.aprendiz || aprendizResData;
          
          // Mapear los datos del servidor al formato esperado por el componente
          setAprendizData({
            idAprendiz: aprendizFromServer.idaprendiz,
            documento: aprendizFromServer.documento_aprendiz,
            abreviaturaTipoDocumento: aprendizFromServer.abreviatura_tipo_documento || '',
            nombres: aprendizFromServer.nombres_aprendiz,
            apellidos: aprendizFromServer.apellidos_aprendiz,
            email: aprendizFromServer.email_aprendiz,
            telefono: aprendizFromServer.telefono_aprendiz?.toString() || '',
            ficha: aprendizFromServer.codigo_ficha?.toString() || '',
            fichaId: aprendizFromServer.ficha_idficha || 0,
            programa: aprendizFromServer.nombre_programa || ''
          });
          
          // Una vez que tenemos la ficha, obtener sus datos
          const fichaId = aprendizFromServer.ficha_idficha;
          if (fichaId) {
            const fichaResponse = await fetch(`http://localhost:8000/fichas/${fichaId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (fichaResponse.ok) {
              const fichaResData = await fichaResponse.json();
              setFichaData(fichaResData.ficha);
            }
          }
          
          // Obtener asistencias
          const asistenciasResponse = await fetch(`http://localhost:8000/asistencia/aprendiz/${id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (asistenciasResponse.ok) {
            const asistenciasResData = await asistenciasResponse.json();
            setAsistencias(asistenciasResData.asistencias || []);
          }
        } else {
          const errorData = await aprendizResponse.json();
          setError(errorData.msg || 'Error al obtener datos del aprendiz');
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
    // Extraer solo la parte de la fecha (ignorar la hora)
    const datePart = dateString.split('T')[0];

    // Si la fecha tiene formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [year, month, day] = datePart.split('-');
      return `${day}/${month}/${year}`;
    }

    // Si no podemos procesar el formato, devolver la fecha con el método actual
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

  // Obtener icono según tipo de asistencia
  const getAsistenciaIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'presente':
        return <CheckCircleIcon color="success" />;
      case 'ausente':
        return <CancelIcon color="error" />;
      case 'tardanza':
        return <WarningIcon color="warning" />;
      default:
        return null;
    }
  };
  
  // Preparar los datos para el DataTable (solo fecha y estado)
  const asistenciasRows = asistencias.map((asistencia) => ({
    id: asistencia.idasistencia,
    fecha: formatDate(asistencia.fecha_asistencia),
    estado: asistencia.nombre_tipo_asistencia
  }));

  // Definir las columnas para el DataTable (solo fecha y estado)
  const asistenciasColumns: GridColDef[] = [
    { 
      field: 'fecha', 
      headerName: 'Fecha', 
      width: 150 
    },
    { 
      field: 'estado', 
      headerName: 'Estado', 
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          icon={getAsistenciaIcon(params.value as string)}
          label={params.value}
          color={getAsistenciaColor(params.value as string)}
          size="small"
        />
      )
    }
  ];
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* Header con nombre (simplificado) */}
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
              <Typography variant="h5">
                Aprendiz: {aprendizData?.nombres} {aprendizData?.apellidos}
              </Typography>
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
                <Card sx={{ height: '100%', boxShadow: 3, overflow: 'hidden' }}>
                  <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Información del Aprendiz
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 2 }}>
                    {!aprendizData ? (
                      <Alert severity="warning">No se encontró información del aprendiz</Alert>
                    ) : (
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AssignmentIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {aprendizData.abreviaturaTipoDocumento ?
                              `${aprendizData.abreviaturaTipoDocumento} ${aprendizData.documento}` :
                              aprendizData.documento}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                          <Typography variant="body2" noWrap>
                            {aprendizData.email}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {aprendizData.telefono || 'No registrado'}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Información de la Ficha */}
              <Grid item xs={12} md={4}>
                <Box sx={{ height: '100%' }}>
                  {aprendizData && 
                    <FichaPaper 
                      fichaId={aprendizData.fichaId} 
                      maxWidth="100%" 
                      maxHeight="100%" 
                      showTitle={true}
                    />
                  }
                </Box>
              </Grid>
              
              {/* Información del Funcionario */}
              <Grid item xs={12} md={4}>
                <Box sx={{ height: '100%' }}>
                  {fichaData && fichaData.funcionario_idfuncionario && (
                    <FuncionarioCard 
                      funcionarioId={fichaData.funcionario_idfuncionario} 
                      maxWidth="100%" 
                      maxHeight="100%"
                      showTitle={true} 
                    />
                  )}
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
                  <DinamicTable
                    rows={asistenciasRows}
                    columns={asistenciasColumns}
                    pagination={{ page: 0, pageSize: 10 }}
                    height={400}
                    width="100%"
                    enableCheckboxSelection={false}
                  />
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