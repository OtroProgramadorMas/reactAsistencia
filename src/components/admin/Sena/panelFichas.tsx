import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleIcon from "@mui/icons-material/People";
import { GridColDef } from "@mui/x-data-grid";
import DinamicTable from "../../shared/dataTable";
import { useNavigate } from "react-router-dom";
import CustomSnackbar from "../../shared/customSnackbar";
import useSnackbar from "../../shared/useSnackbar";

// Interfaz adaptada a la estructura real
interface Ficha {
  idficha?: number;
  codigo_ficha: string;
  fecha_inicio: string;
  programa_idprograma: number;
  estado_ficha_idestado_ficha: number;
  nombre_estado_ficha?: string; // Agregamos el nombre del estado
  id?: number; // Para DataGrid
}

interface EstadoFicha {
  idestado_ficha: number;
  estado_ficha: string; // Ajustando al nombre real del campo
}

interface FichasPanelProps {
  programaId: string | null;
  nombrePrograma: string;
}

const FichasPanel: React.FC<FichasPanelProps> = ({ programaId, nombrePrograma }) => {
  const navigate = useNavigate();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [estadosFicha, setEstadosFicha] = useState<EstadoFicha[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editando, setEditando] = useState(false);
  const [fichaActual, setFichaActual] = useState<number | null>(null);
  const [nuevaFicha, setNuevaFicha] = useState({
    codigo: "",
    fecha_inicio: "",
    programa_idprograma: programaId,
    estado_ficha_idestado_ficha: 1 // Valor por defecto
  });
  
  // Usamos nuestro hook personalizado para el Snackbar
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const fetchEstadosFicha = async () => {
    const token = localStorage.getItem("token");
    setLoadingEstados(true);

    try {
      const res = await fetch("http://localhost:8000/estados_ficha", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (data.success && Array.isArray(data.estados)) {
        console.log("Estados de ficha obtenidos:", data.estados);
        setEstadosFicha(data.estados);
      } else {
        console.error("Error en estructura de datos:", data);
        showSnackbar("No se pudieron cargar los estados de ficha", "error");
      }
    } catch (err) {
      console.error("Error en fetchEstadosFicha:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    } finally {
      setLoadingEstados(false);
    }
  };

  const fetchFichas = async () => {
    if (!programaId) return;
    
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/fichas/programa/${programaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (data.success && Array.isArray(data.fichas)) {
        // Procesamos los datos para asegurar que cada ficha tenga un id
        const fichasConIds = data.fichas.map((f: any) => ({
          ...f,
          id: f.idficha || Math.random(), // Si no hay idficha, generamos un id único
          // Preparamos los datos de fecha para evitar problemas
          fecha_inicio_formateada: f.fecha_inicio ? new Date(f.fecha_inicio).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : 'N/A',
          // Buscamos el nombre del estado de la ficha
          nombre_estado_ficha: estadosFicha.find(e => e.idestado_ficha === f.estado_ficha_idestado_ficha)?.estado_ficha || 'Desconocido'
        }));
        setFichas(fichasConIds);
      } else {
        showSnackbar("No se pudieron cargar las fichas", "error");
      }
    } catch (err) {
      console.error("Error en fetchFichas:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    // Modificado: Navegar directamente a la ruta de programas en lugar de usar navigate(-1)
    navigate(-1);
  };

  const handleVerAprendices = (ficha: Ficha) => {
    const codigo_ficha = ficha.codigo_ficha || "sin-codigo";
    
    console.log("Navegando a aprendices simplificado");
    // Prueba primero solo con el ID sin query params
    navigate(`/admin/aprendices/${ficha.idficha}`);
  };

  const handleOpenDialog = (editar = false, ficha?: Ficha) => {
    if (editar && ficha) {
      setEditando(true);
      setFichaActual(ficha.idficha || null);
      setNuevaFicha({
        codigo: ficha.codigo_ficha || '',
        fecha_inicio: ficha.fecha_inicio ? ficha.fecha_inicio.split('T')[0] : '',
        programa_idprograma: programaId,
        estado_ficha_idestado_ficha: ficha.estado_ficha_idestado_ficha || 1
      });
    } else {
      setEditando(false);
      setFichaActual(null);
      setNuevaFicha({
        codigo: "",
        fecha_inicio: "",
        programa_idprograma: programaId,
        estado_ficha_idestado_ficha: 2 // Estado "iniciar" por defecto
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevaFicha({
      ...nuevaFicha,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    setNuevaFicha({
      ...nuevaFicha,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardarFicha = async () => {
    const token = localStorage.getItem("token");

    // Validaciones básicas
    if (!nuevaFicha.codigo.trim() || !nuevaFicha.fecha_inicio) {
      showSnackbar("Los campos código y fecha de inicio son obligatorios", "error");
      return;
    }

    try {
      let url = "http://localhost:8000/fichas";
      let method = "POST";

      // Si estamos editando, cambiamos la URL y el método
      if (editando && fichaActual) {
        url = `http://localhost:8000/fichas/${fichaActual}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaFicha),
      });

      const result = await res.json();
      if (result.success) {
        showSnackbar(
          editando ? "Ficha actualizada exitosamente" : "Ficha creada exitosamente",
          "success"
        );
        fetchFichas(); // recarga tabla
        handleCloseDialog(); // cierra formulario
      } else {
        showSnackbar(
          result.msg || "Error al guardar la ficha",
          "error"
        );
      }
    } catch (err) {
      console.error("Error al guardar ficha:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    }
  };

  const handleEliminar = async (idficha: number) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta ficha?")) return;

    try {
      const res = await fetch(`http://localhost:8000/fichas/${idficha}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        showSnackbar("Ficha eliminada exitosamente", "success");
        fetchFichas();
      } else {
        showSnackbar(data.msg || "No se pudo eliminar la ficha", "error");
      }
    } catch (error) {
      console.error("Error al eliminar ficha:", error);
      showSnackbar("Error al conectar con el servidor", "error");
    }
  };

  useEffect(() => {
    // Primero cargamos los estados de ficha
    fetchEstadosFicha();
  }, []);

  useEffect(() => {
    // Una vez que tengamos los estados, cargamos las fichas
    if (programaId && !loadingEstados) {
      fetchFichas();
    }
  }, [programaId, loadingEstados, estadosFicha]);

  // Definimos las columnas sin usar valueFormatter para evitar errores
  const columns: GridColDef[] = [
    { field: "idficha", headerName: "ID", width: 80 },
    { field: "codigo_ficha", headerName: "Código de Ficha", width: 150 },
    { 
      field: "fecha_inicio_formateada", 
      headerName: "Fecha de Inicio", 
      width: 150 
    },
    {
      field: "estado_ficha",
      headerName: "Estado de Ficha",
      width: 150
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 300,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<PeopleIcon />}
            onClick={() => handleVerAprendices(params.row)}
          >
            Aprendices
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenDialog(true, params.row)}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleEliminar(params.row.idficha)}
          >
            Eliminar
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={handleVolver}
          sx={{ mr: 2 }}
        >
          Volver a Programas
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Fichas del Programa: {nombrePrograma}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          ID del programa: {programaId}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6">Fichas registradas</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Agregar nueva ficha
        </Button>
      </Box>

      {loading || loadingEstados ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DinamicTable
          rows={fichas}
          columns={columns}
          pagination={{ page: 0, pageSize: 10 }}
        />
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editando ? "Editar ficha" : "Agregar nueva ficha"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Código de Ficha"
            name="codigo"
            fullWidth
            value={nuevaFicha.codigo}
            onChange={handleChange}
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Fecha de Inicio"
            name="fecha_inicio"
            type="date"
            fullWidth
            value={nuevaFicha.fecha_inicio}
            onChange={handleChange}
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ mb: 2 }}
          />
          {/* Solo mostramos el select para editar, no para crear nueva ficha */}
          {editando && (
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
              <InputLabel id="estado-ficha-label">Estado de Ficha</InputLabel>
              <Select
                labelId="estado-ficha-label"
                id="estado_ficha_idestado_ficha"
                name="estado_ficha_idestado_ficha"
                value={nuevaFicha.estado_ficha_idestado_ficha}
                label="Estado de Ficha"
                onChange={handleSelectChange}
              >
                {estadosFicha.map((estado) => (
                  <MenuItem key={estado.idestado_ficha} value={estado.idestado_ficha}>
                    {estado.estado_ficha}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleGuardarFicha} variant="contained" color="primary">
            {editando ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Usando nuestro componente CustomSnackbar */}
      <CustomSnackbar 
        snackbar={snackbar} 
        handleClose={closeSnackbar} 
      />
    </Paper>
  );
};

export default FichasPanel;