import React, { useState, useEffect } from "react";
import DinamicTable from "../shared/dataTable";
import {
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Typography,
  Box,
  Stack,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import FichaPaper from "../../components/shared/paper_ficha";

type Asistencia = {
  id: number;
  aprendiz: string;
  documento: string;
  estado: "Presente" | "Ausente" | "Justificado";
  estadoTemporal?: string;
};

const PanelRegistroAsistencia = ({ value }: { value: string }) => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Cargar datos de aprendices desde el backend
  useEffect(() => {
    const cargarAprendices = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No se encontró token de autenticación");
        }

        // Petición para obtener aprendices por ficha
        const response = await fetch(`http://localhost:8000/aprendiz_ficha/${value}`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener aprendices: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.msg || "Error al obtener datos de aprendices");
        }

        // Transformar datos al formato de asistencias
        const aprendicesFormateados: Asistencia[] = data.aprendices.map((aprendiz: any) => ({
          id: aprendiz.idaprendiz,
          aprendiz: `${aprendiz.nombres_aprendiz} ${aprendiz.apellidos_aprendiz}`,
          documento: aprendiz.documento_aprendiz,
          estado: "Presente", // Estado predeterminado
        }));

        setAsistencias(aprendicesFormateados);
      } catch (err) {
        console.error("Error al cargar aprendices:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        // Cargar datos de ejemplo si hay un error (solo para desarrollo)
        const mockData: Asistencia[] = [
          { id: 1, aprendiz: "Juan Pérez", documento: "123456789", estado: "Presente" },
          { id: 2, aprendiz: "María Gómez", documento: "987654321", estado: "Ausente" },
        ];
        setAsistencias(mockData);
      } finally {
        setLoading(false);
      }
    };

    if (value) {
      cargarAprendices();
    }
  }, [value]);

  const handleEstadoChange = (id: number, nuevoEstado: string) => {
    setAsistencias((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estadoTemporal: nuevoEstado } : item
      )
    );
  };

  const enviarAsistencias = async () => {
    setLoading(true);
    setError(null);
    
    const datosParaEnviar = asistencias.map((item) => ({
      fichaId: value,
      aprendizId: item.id,
      documento: item.documento,
      fecha: fecha,
      estado: item.estadoTemporal || item.estado,
    }));

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const response = await fetch("http://localhost:8000/asistencias/registrar", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(datosParaEnviar),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Error al guardar asistencias");
      }
      
      setSuccess(true);
      // Resetear estados temporales
      setAsistencias(prev => 
        prev.map(item => ({...item, estadoTemporal: undefined}))
      );
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Error al guardar asistencias");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar aprendices por búsqueda
  const aprendicesFiltrados = asistencias.filter(item => 
    item.aprendiz.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.documento.includes(searchTerm)
  );

  // Estadísticas de asistencia
  const estadisticas = {
    total: asistencias.length,
    presentes: asistencias.filter(a => (a.estadoTemporal || a.estado) === "Presente").length,
    ausentes: asistencias.filter(a => (a.estadoTemporal || a.estado) === "Ausente").length,
    justificados: asistencias.filter(a => (a.estadoTemporal || a.estado) === "Justificado").length,
  };

  const columns = [
    { 
      field: "aprendiz", 
      headerName: "Aprendiz", 
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" fontSize="small" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    },
    { 
      field: "documento", 
      headerName: "Documento", 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          variant="outlined" 
          color="default"
          sx={{ borderRadius: 1 }}
        />
      )
    },
    {
      field: "estado",
      headerName: "Estado de Asistencia",
      width: 350,
      renderCell: (params) => (
        <RadioGroup
          row
          value={params.row.estadoTemporal || params.row.estado}
          onChange={(e) => handleEstadoChange(params.row.id, e.target.value)}
        >
          <FormControlLabel 
            value="Presente" 
            control={<Radio size="small" />} 
            label={<Typography variant="body2">Presente</Typography>} 
            sx={{ 
              '&.MuiFormControlLabel-root': { 
                backgroundColor: (params.row.estadoTemporal || params.row.estado) === 'Presente' ? 'rgba(46, 125, 50, 0.1)' : 'transparent',
                borderRadius: 1,
                padding: '2px 8px',
                marginRight: 1
              }
            }}
          />
          <FormControlLabel 
            value="Ausente" 
            control={<Radio size="small" />} 
            label={<Typography variant="body2">Ausente</Typography>} 
            sx={{ 
              '&.MuiFormControlLabel-root': { 
                backgroundColor: (params.row.estadoTemporal || params.row.estado) === 'Ausente' ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
                borderRadius: 1,
                padding: '2px 8px',
                marginRight: 1
              }
            }}
          />
          <FormControlLabel 
            value="Justificado" 
            control={<Radio size="small" />} 
            label={<Typography variant="body2">Justificado</Typography>} 
            sx={{ 
              '&.MuiFormControlLabel-root': { 
                backgroundColor: (params.row.estadoTemporal || params.row.estado) === 'Justificado' ? 'rgba(237, 108, 2, 0.1)' : 'transparent',
                borderRadius: 1,
                padding: '2px 8px'
              }
            }}
          />
        </RadioGroup>
      ),
    },
  ];

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500" color="primary">
          Registro de Asistencia
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestione la asistencia de los aprendices para la ficha seleccionada
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={3}>
        {/* Panel izquierdo con selector de fecha */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            flex: '1 1 300px', 
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="h6" gutterBottom>
            <CalendarMonthIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Fecha de Registro
          </Typography>
          <Box mt={2}>
            <TextField
              type="date"
              fullWidth
              variant="outlined"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Seleccione la fecha para registrar la asistencia"
            />
          </Box>

          <Box mt={3}>
            <Typography variant="subtitle2" gutterBottom>
              Resumen de Asistencia
            </Typography>
            <Stack direction="row" spacing={1} mt={1}>
              <Chip 
                label={`Total: ${estadisticas.total}`} 
                color="default" 
                variant="outlined" 
              />
              <Chip 
                label={`Presentes: ${estadisticas.presentes}`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                label={`Ausentes: ${estadisticas.ausentes}`} 
                color="error" 
                variant="outlined" 
              />
              <Chip 
                label={`Justificados: ${estadisticas.justificados}`} 
                color="warning" 
                variant="outlined" 
              />
            </Stack>
          </Box>
        </Paper>
  
        {/* FichaPaper a la derecha */}
        <Box sx={{ flex: '1 1 300px' }}>
          <FichaPaper fichaId={Number(value)} />
        </Box>
      </Box>
  
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            Listado de Aprendices ({fecha})
          </Typography>
          
          <TextField
            placeholder="Buscar por nombre o documento"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <DinamicTable
              rows={aprendicesFiltrados}
              columns={columns}
              pagination={{ page: 0, pageSize: 10 }}
            />
            
            <Divider sx={{ my: 3 }} />
            
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={enviarAsistencias}
                disabled={loading}
                startIcon={<SaveIcon />}
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  boxShadow: 3
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar Asistencias"}
              </Button>
            </Box>
          </>
        )}
      </Paper>
      
      {/* Notificación de éxito */}
      <Snackbar 
        open={success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled">
          ¡Asistencias registradas correctamente!
        </Alert>
      </Snackbar>
    </>
  );
};

export default PanelRegistroAsistencia;