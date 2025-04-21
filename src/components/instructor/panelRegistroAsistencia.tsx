import React, { useState, useEffect } from "react";
import DinamicTable from "../shared/dataTable";
import {
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  styled
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FichaPaper from "../../components/shared/paper_ficha";
import ControlBotonesAsistencia from "./ControlBotonesAsistencia";
import useSnackbar from "../shared/useSnackbar";
import CustomSnackbar from "../shared/customSnackbar";

type Asistencia = {
  id: number;
  aprendiz: string;
  documento: string;
};

type TipoAsistencia = {
  idtipo_asistencia: number;
  nombre_tipo_asistencia: string;
};

type AsistenciaRegistrada = {
  idasistencia: number;
  aprendiz_idaprendiz: number;
  tipo_asistencia_idtipo_asistencia: number;
};

// Radio personalizado con colores según el tipo de asistencia
const StyledRadio = styled(Radio)(({ theme, tipoNombre }) => {
  let color = theme.palette.primary.main;
  
  if (tipoNombre) {
    const nombreLowerCase = tipoNombre.toLowerCase();
    if (nombreLowerCase === 'presente') {
      color = theme.palette.success.main; // Verde para presente
    } else if (nombreLowerCase === 'tardanza') {
      color = theme.palette.warning.main; // Amarillo para tardanza
    } else if (nombreLowerCase === 'ausente') {
      color = theme.palette.error.main; // Rojo para ausente
    }
  }
  
  return {
    '&.Mui-checked': {
      color: color,
    },
    '&:hover': {
      backgroundColor: `${color}10`,
    },
  };
});

const PanelRegistroAsistencia = ({ value }: { value: string }) => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tiposAsistencia, setTiposAsistencia] = useState<TipoAsistencia[]>([]);
  const [loadingTipos, setLoadingTipos] = useState<boolean>(false);
  const [errorTipos, setErrorTipos] = useState<string | null>(null);
  const [estadoTemporal, setEstadoTemporal] = useState<{ [key: number]: number }>({});
  const [asistenciasRegistradas, setAsistenciasRegistradas] = useState<AsistenciaRegistrada[]>([]);
  const [loadingAsistencias, setLoadingAsistencias] = useState<boolean>(false);
  const [errorAsistencias, setErrorAsistencias] = useState<string | null>(null);

  // Usando el hook personalizado para snackbars
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    const cargarAprendices = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se encontró token");

        const response = await fetch(`http://localhost:8000/aprendices/ficha/${value}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Error al obtener aprendices");

        const data = await response.json();

        const aprendicesFormateados: Asistencia[] = data.aprendices.map((a: any) => ({
          id: a.idaprendiz,
          aprendiz: `${a.nombres_aprendiz} ${a.apellidos_aprendiz}`,
          documento: `${a.abreviatura_tipo_documento}  ${a.documento_aprendiz}`,
        }));

        setAsistencias(aprendicesFormateados);
      } catch (err) {
        setError("No se pudieron cargar los aprendices");
        setAsistencias([]);
      } finally {
        setLoading(false);
      }
    };

    const cargarTiposAsistencia = async () => {
      setLoadingTipos(true);
      setErrorTipos(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se encontró token");
        const response = await fetch("http://localhost:8000/asistencia/tipos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Error al obtener tipos");

        const data = await response.json();

        if (!data.success || !Array.isArray(data.tipos)) {
          throw new Error("Formato de datos inválido");
        }

        setTiposAsistencia(data.tipos);
      } catch (err) {
        console.error("Error al obtener tipos de asistencia:", err);
        setErrorTipos(err instanceof Error ? err.message : "Error desconocido");
        setTiposAsistencia([]);
      } finally {
        setLoadingTipos(false);
      }
    };

    if (value) {
      cargarAprendices();
      cargarTiposAsistencia();
    }
  }, [value]);

  // Obtener los registros de asistencia existentes para la fecha y ficha
  useEffect(() => {
    const cargarAsistenciasRegistradas = async () => {
      if (!fecha || !value) return;

      setLoadingAsistencias(true);
      setErrorAsistencias(null);

      // Limpiar el estado temporal al cambiar la fecha
      setEstadoTemporal({});

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se encontró token");

        // Usar el endpoint para obtener las asistencias registradas
        const response = await fetch(`http://localhost:8000/asistencias/fecha-ficha`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fecha,
            idFicha: Number(value)
          })
        });

        if (!response.ok) throw new Error("Error al obtener asistencias registradas");

        const data = await response.json();

        if (data.success && Array.isArray(data.asistencias)) {
          setAsistenciasRegistradas(data.asistencias);

          // Si hay asistencias registradas, actualizar el estado temporal
          if (data.asistencias.length > 0) {
            const nuevoEstado: { [key: number]: number } = {};
            data.asistencias.forEach((asistencia: AsistenciaRegistrada) => {
              nuevoEstado[asistencia.aprendiz_idaprendiz] = asistencia.tipo_asistencia_idtipo_asistencia;
            });

            setEstadoTemporal(nuevoEstado);
          }
        }
      } catch (err) {
        console.error("Error obteniendo asistencias:", err);
        setErrorAsistencias(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoadingAsistencias(false);
      }
    };

    cargarAsistenciasRegistradas();
  }, [fecha, value]);

  // Función para obtener el nombre del tipo de asistencia
  const getNombreTipoAsistencia = (tipoId: number) => {
    const tipo = tiposAsistencia.find(t => t.idtipo_asistencia === tipoId);
    return tipo ? tipo.nombre_tipo_asistencia : "N/A";
  };

  const handleEstadoChange = (id: number, tipoId: number) => {
    setEstadoTemporal((prev) => ({
      ...prev,
      [id]: tipoId,
    }));
  };

  // Función para obtener el color según el tipo de asistencia
  const getColorByTipo = (tipoNombre: string): string => {
    const nombreLowerCase = tipoNombre.toLowerCase();
    if (nombreLowerCase === 'presente') return '#4caf50';
    if (nombreLowerCase === 'tardanza') return '#ff9800';
    if (nombreLowerCase === 'ausente') return '#f44336';
    return '#1976d2'; // Color por defecto
  };

  const columns = [
    { field: "aprendiz", headerName: "Aprendiz", width: 250 },
    { field: "documento", headerName: "Documento", width: 150 },
    {
      field: "estado",
      headerName: "Asistencia",
      width: 400,
      renderCell: (params: any) => {
        const id = params.row.id;
        const selected = estadoTemporal[id] || "";

        if (loadingTipos) return <CircularProgress size={20} />;
        if (errorTipos) return <Typography color="error">Error cargando tipos</Typography>;

        return (
          <RadioGroup
            row
            value={selected}
            onChange={(e) => handleEstadoChange(id, parseInt(e.target.value))}
            sx={{ flexWrap: 'nowrap' }}
          >
            {tiposAsistencia.map((tipo) => (
              <FormControlLabel
                key={tipo.idtipo_asistencia}
                value={tipo.idtipo_asistencia}
                control={
                  <StyledRadio 
                    size="small" 
                    tipoNombre={tipo.nombre_tipo_asistencia}
                  />
                }
                label={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: selected === tipo.idtipo_asistencia ? getColorByTipo(tipo.nombre_tipo_asistencia) : 'text.secondary',
                      fontWeight: selected === tipo.idtipo_asistencia ? 'bold' : 'normal'
                    }}
                  >
                    {tipo.nombre_tipo_asistencia}
                  </Typography>
                }
                sx={{ 
                  mr: 2, 
                  borderRadius: 1,
                  px: 1,
                  backgroundColor: selected === tipo.idtipo_asistencia ? `${getColorByTipo(tipo.nombre_tipo_asistencia)}15` : 'transparent'
                }}
              />
            ))}
          </RadioGroup>
        );
      },
    },
  ];

  // Cuando cambia la fecha, recargar los datos de asistencia
  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFecha(e.target.value);
  };

  // Función para recargar asistencias después de guardar/actualizar
  const cargarAsistenciasActualizadas = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No se encontró token");

      const response = await fetch(`http://localhost:8000/asistencias/fecha-ficha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha,
          idFicha: Number(value)
        })
      });

      if (!response.ok) throw new Error("Error al obtener asistencias actualizadas");

      const data = await response.json();

      if (data.success && Array.isArray(data.asistencias)) {
        setAsistenciasRegistradas(data.asistencias);

        // Actualizar el estado temporal con los nuevos valores
        if (data.asistencias.length > 0) {
          const nuevoEstado: { [key: number]: number } = {};
          data.asistencias.forEach((asistencia: AsistenciaRegistrada) => {
            nuevoEstado[asistencia.aprendiz_idaprendiz] = asistencia.tipo_asistencia_idtipo_asistencia;
          });
          setEstadoTemporal(nuevoEstado);
        } else {
          // Si no hay registros, limpiar el estado temporal
          setEstadoTemporal({});
        }
      }
    } catch (err) {
      console.error("Error actualizando asistencias:", err);
      setErrorAsistencias(err instanceof Error ? err.message : "Error desconocido");
    }
  };

  // Función para manejar cuando se completa una operación
  const handleCompletado = () => {
    cargarAsistenciasActualizadas();
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500" color="primary">
          Asistencia de Aprendices
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consulta del listado de asistencia por ficha
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={3}>
        <Paper elevation={3} sx={{ p: 1.5, flex: '1 1 300px', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Fecha de Registro
          </Typography>
          <Box mt={2}>
            <TextField
              type="date"
              fullWidth
              variant="outlined"
              value={fecha}
              onChange={handleFechaChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon />
                  </InputAdornment>
                ),
              }}
              helperText="Seleccione la fecha"
            />
          </Box>
        </Paper>

        <Box sx={{ flex: '1 1 300px' }}>
          <FichaPaper
            fichaId={Number(value)}
            showTitle={false} />
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, width:"90%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Listado de Aprendices ({fecha})</Typography>
          {loadingAsistencias && <CircularProgress size={24} />}
          {asistenciasRegistradas.length > 0 && (
            <Alert severity="info" sx={{ ml: 2 }}>
              Hay registros de asistencia para esta fecha
            </Alert>
          )}
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" height="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <DinamicTable
            rows={asistencias}
            columns={columns}
            pagination={{ page: 0, pageSize: 10 }}
            enableCheckboxSelection={false}
            width={"100%"}
            height={400}
          />
        )}

        {!loading && !error && (
          <ControlBotonesAsistencia
            fecha={fecha}
            idAprendices={asistencias.map(a => a.id)}
            fichaId={Number(value)}
            estadosAsistencia={estadoTemporal}
            existenRegistros={asistenciasRegistradas.length > 0}
            onCompletado={handleCompletado}
            showSnackbar={showSnackbar}
          />
        )}
      </Paper>

      {/* Componente CustomSnackbar que muestra las notificaciones */}
      <CustomSnackbar
        snackbar={snackbar}
        handleClose={closeSnackbar}
      />
    </>
  );
};

export default PanelRegistroAsistencia;