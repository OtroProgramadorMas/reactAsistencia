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
  SelectChangeEvent,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from "@mui/icons-material/Add";
import SchoolIcon from "@mui/icons-material/School";
import { GridColDef } from "@mui/x-data-grid";
import DinamicTable from "../../shared/dataTable";
import { useNavigate, useLocation } from "react-router-dom";
import CustomSnackbar from "../../shared/customSnackbar";
import useSnackbar from "../../shared/useSnackbar";
import HierarchyNavigation from "../../shared/Animation/HierarchyNavigation";
import ModalAsignacionInstructor from "./modalAsignacionInstructor";

// API URL base
const API_URL = "http://localhost:8000";

// Interfaz adaptada a la estructura real
interface Ficha {
  idficha?: number;
  codigo_ficha: string;
  fecha_inicio: string;
  programa_idprograma: number;
  estado_ficha_idestado_ficha: number;
  nombre_estado_ficha?: string; // Agregamos el nombre del estado
  funcionario_idfuncionario?: number; // ID del instructor asignado
  nombre_instructor?: string; // Nombre del instructor asignado
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
  const location = useLocation();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [estadosFicha, setEstadosFicha] = useState<EstadoFicha[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEstados, setLoadingEstados] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAsignacionModal, setOpenAsignacionModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [fichaActual, setFichaActual] = useState<number | null>(null);
  const [nuevaFicha, setNuevaFicha] = useState({
    codigo: "",
    fecha_inicio: "",
    programa_idprograma: programaId,
    estado_ficha_idestado_ficha: 1 // Valor por defecto
  });

  // Estado para la animación
  const [showAnimation, setShowAnimation] = useState(false);

  // Estado para notificaciones adicionales
  const [notificacion, setNotificacion] = useState<{
    mensaje: string;
    tipo: "success" | "error" | "info" | "warning";
    abierto: boolean;
  }>({
    mensaje: "",
    tipo: "info",
    abierto: false
  });

  // Extraer datos adicionales del estado si están disponibles
  const stateData = location.state || {};
  const nombreProgramaFromState = stateData.nombrePrograma || nombrePrograma;

  // Usamos nuestro hook personalizado para el Snackbar
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    // Activamos la animación después de un breve delay
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchEstadosFicha = async () => {
    const token = localStorage.getItem("token");
    setLoadingEstados(true);

    try {
      const res = await fetch(`${API_URL}/estados_ficha`, {
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
      const res = await fetch(`${API_URL}/fichas/programa/${programaId}`, {
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

  const handleVerAprendices = (ficha: Ficha) => {
    const codigoFicha = ficha.codigo_ficha || "sin-codigo";

    // Navegar con información para la animación
    navigate(`/admin/aprendices/${ficha.idficha}`, {
      state: {
        codigoFicha: codigoFicha,
        nombrePrograma: nombreProgramaFromState,
        programaId: programaId
      }
    });
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
      let url = `${API_URL}/fichas`;
      let method = "POST";

      // Si estamos editando, cambiamos la URL y el método
      if (editando && fichaActual) {
        url = `${API_URL}/fichas/${fichaActual}`;
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
      const res = await fetch(`${API_URL}/fichas/${idficha}`, {
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

  // Manejadores para asignación de instructor
  const handleOpenAsignacionModal = (ficha: Ficha) => {
    setFichaActual(ficha.idficha || null);
    setOpenAsignacionModal(true);
  };

  const handleCloseAsignacionModal = () => {
    setOpenAsignacionModal(false);
    setFichaActual(null);
  };

  const handleAsignarInstructor = async (fichaId: number, funcionarioId: number) => {
    const token = localStorage.getItem("token");
    
    try {
      // Endpoint para asignar instructor a ficha usando la ruta específica
      const url = `${API_URL}/funcionarios/fichas/asignar`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idFuncionario: funcionarioId,
          idFicha: fichaId
        }),
      });

      const result = await res.json();
      
      if (result.success) {
        setNotificacion({
          mensaje: result.message || "Instructor asignado exitosamente",
          tipo: "success",
          abierto: true
        });
        
        // Recargar fichas para mostrar la actualización
        fetchFichas();
      } else {
        throw new Error(result.message || "Error al asignar instructor");
      }
    } catch (err) {
      console.error("Error al asignar instructor:", err);
      setNotificacion({
        mensaje: err instanceof Error ? err.message : "Error al asignar instructor",
        tipo: "error",
        abierto: true
      });
      throw err;
    }
  };

  const handleCloseNotificacion = () => {
    setNotificacion({ ...notificacion, abierto: false });
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
    { field: "idficha", headerName: "ID", width: 70 },
    { field: "codigo_ficha", headerName: "Código de Ficha", width: 140 },
    {
      field: "fecha_inicio_formateada",
      headerName: "Fecha de Inicio",
      width: 130
    },
    {
      field: "nombre_estado_ficha",
      headerName: "Estado",
      width: 120
    },
    {
      field: "nombre_instructor",
      headerName: "Instructor",
      width: 180,
      renderCell: (params) => (
        params.row.nombre_instructor ? (
          <Typography variant="body2">{params.row.nombre_instructor}</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">Sin asignar</Typography>
        )
      )
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Ver Aprendices">
            <IconButton
              color="primary"
              onClick={() => handleVerAprendices(params.row)}
            >
              <PersonIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Asignar Instructor">
            <IconButton
              color="secondary"
              onClick={() => handleOpenAsignacionModal(params.row)}
            >
              <SchoolIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar Ficha">
            <IconButton
              color="default"
              onClick={() => handleOpenDialog(true, params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar Ficha">
            <IconButton
              color="error"
              onClick={() => handleEliminar(params.row.idficha)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Componente de navegación jerárquica */}
      <HierarchyNavigation
        currentLevel="ficha"
        programaId={programaId || undefined}
        programaNombre={nombreProgramaFromState}
        fichaNumero="Fichas"
        transitionIn={showAnimation}
      />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion de Fichas
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Programa: {nombreProgramaFromState} (ID: {programaId})
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h6">Fichas registradas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
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
          width={"100%"}
        />
      )}

      {/* Modal para agregar/editar ficha */}
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

      {/* Modal para asignación de instructor */}
      <ModalAsignacionInstructor
        open={openAsignacionModal}
        onClose={handleCloseAsignacionModal}
        fichaId={fichaActual}
        onSave={handleAsignarInstructor}
      />

      {/* Notificaciones adicionales */}
      <Snackbar
        open={notificacion.abierto}
        autoHideDuration={6000}
        onClose={handleCloseNotificacion}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotificacion}
          severity={notificacion.tipo}
          sx={{ width: '100%' }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>

      {/* Usando nuestro componente CustomSnackbar */}
      <CustomSnackbar
        snackbar={snackbar}
        handleClose={closeSnackbar}
      />
    </Paper>
  );
};

export default FichasPanel;