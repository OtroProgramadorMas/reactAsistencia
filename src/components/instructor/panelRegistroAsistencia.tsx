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
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SearchIcon from "@mui/icons-material/Search";
import FichaPaper from "../../components/shared/paper_ficha";

type Asistencia = {
  id: number;
  aprendiz: string;
  documento: string;
};

type TipoAsistencia = {
  id: number;
  nombre: string;
};

const PanelRegistroAsistencia = ({ value }: { value: string }) => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [tiposAsistencia, setTiposAsistencia] = useState<TipoAsistencia[]>([]);
  const [loadingTipos, setLoadingTipos] = useState<boolean>(false);
  const [errorTipos, setErrorTipos] = useState<string | null>(null);
  const [estadoTemporal, setEstadoTemporal] = useState<{ [key: number]: number }>({});

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
          documento: a.documento_aprendiz,
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
        
        if (!Array.isArray(data.tipos)) {
          throw new Error("Formato de datos inválido");
        }
    
        // Transformar el formato de los datos para que coincidan con la estructura esperada
        const tiposFormateados = data.tipos.map((tipo: any) => ({
          id: tipo.idtipo_asistencia,
          nombre: tipo.nombre_tipo_asistencia
        }));
    
        setTiposAsistencia(tiposFormateados);
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

  const handleEstadoChange = (id: number, tipoId: number) => {
    setEstadoTemporal((prev) => ({
      ...prev,
      [id]: tipoId,
    }));
  };

  const aprendicesFiltrados = asistencias.filter(item =>
    item.aprendiz.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.documento.includes(searchTerm)
  );

  const columns = [
    { field: "aprendiz", headerName: "Aprendiz", width: 250 },
    { field: "documento", headerName: "Documento", width: 150 },
    {
      field: "estado",
      headerName: "Tipo de Asistencia",
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
          >
            {tiposAsistencia.length > 0 ? (
              tiposAsistencia.map((tipos) => (
                <FormControlLabel
                  key={tipos.id}
                  value={tipos.id}
                  control={<Radio size="small" />}
                  label={tipos.nombre}
                />
              ))
            ) : (
              <Typography variant="body2">No hay tipos disponibles</Typography>
            )}
          </RadioGroup>
        );
      },
    },
  ];

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
        <Paper elevation={3} sx={{ p: 3, flex: '1 1 300px', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
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
                    <CalendarMonthIcon />
                  </InputAdornment>
                ),
              }}
              helperText="Seleccione la fecha"
            />
          </Box>
        </Paper>

        <Box sx={{ flex: '1 1 300px' }}>
          <FichaPaper fichaId={Number(value)} />
        </Box>
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Listado de Aprendices ({fecha})</Typography>
          <TextField
            placeholder="Buscar por nombre o documento"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" height="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <DinamicTable
            rows={aprendicesFiltrados}
            columns={columns}
            pagination={{ page: 0, pageSize: 10 }}
          />
        )}
      </Paper>
    </>
  );
};

export default PanelRegistroAsistencia;