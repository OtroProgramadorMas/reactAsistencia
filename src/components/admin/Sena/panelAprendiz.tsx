// Actualización para panelAprendiz.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useNavigate, useLocation } from "react-router-dom";
import DinamicTable from "../../shared/dataTable";
import CustomSnackbar from "../../shared/customSnackbar";
import useSnackbar from "../../shared/useSnackbar";
import FormularioAprendiz from "./FormularioAprendiz ";
import HierarchyNavigation from "../../shared/Animation/HierarchyNavigation";

// Interfaz del aprendiz, adaptada según el modelo
interface Aprendiz {
  idaprendiz: number | null;
  documento_aprendiz: string;
  nombres_aprendiz: string;
  apellidos_aprendiz: string;
  telefono_aprendiz: string;
  email_aprendiz: string;
  password_aprendiz: string;
  ficha_idficha: number;
  estado_aprendiz_idestado_aprendiz: number;
  tipo_documento_idtipo_documento: number;
  nombre_estado_aprendiz?: string;
  tipo_documento?: string;
  abreviatura_tipo_documento?: string;
  estado_aprendiz: string;
  id?: number; // para DataGrid
}

interface AprendizPanelProps {
  fichaId: string;
  codigoFicha: string;
  nombrePrograma: string;
}

const PanelAprendiz: React.FC<AprendizPanelProps> = ({ fichaId, codigoFicha, nombrePrograma }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [openFormulario, setOpenFormulario] = useState(false);
  const [aprendizSeleccionado, setAprendizSeleccionado] = useState<Aprendiz | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{open: boolean, id: number | null}>({
    open: false, 
    id: null
  });
  
  // Estado para la animación
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Extraemos datos del estado de navegación si están disponibles
  const stateData = location.state || {};
  const nombreProgramaFromState = stateData.nombrePrograma || nombrePrograma || "";
  const codigoFichaFromState = stateData.codigoFicha || codigoFicha || "";
  const programaIdFromState = stateData.programaId || "";
  
  useEffect(() => {
    // Activamos la animación después de un breve delay
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchAprendices = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/aprendices/ficha/${fichaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.aprendices)) {
        const aprendicesConId = data.aprendices.map((a: any) => ({
          ...a,
          id: a.idaprendiz, // Asignamos el ID para DataGrid
          estado_aprendiz: a.estado_aprendiz // 👈 Añadido aquí
        }));
        setAprendices(aprendicesConId);
      } else {
        showSnackbar("No se pudieron cargar los aprendices", "error");
      }
    } catch (err) {
      console.error("Error al obtener aprendices:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirFormulario = (aprendiz?: Aprendiz) => {
    if (aprendiz) {
      setAprendizSeleccionado(aprendiz);
    } else {
      setAprendizSeleccionado(null);
    }
    setOpenFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setOpenFormulario(false);
    setAprendizSeleccionado(null);
  };

  const handleEliminarAprendiz = (id: number) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmarEliminacion = async () => {
    if (!confirmDelete.id) return;
    
    const token = localStorage.getItem("token");
    
    try {
      const res = await fetch(`http://localhost:8000/aprendiz/${confirmDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (data.success) {
        showSnackbar("Aprendiz eliminado exitosamente", "success");
        fetchAprendices();
      } else {
        showSnackbar(data.msg || "No se pudo eliminar el aprendiz", "error");
      }
    } catch (err) {
      console.error("Error al eliminar aprendiz:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  const handleCancelarEliminacion = () => {
    setConfirmDelete({ open: false, id: null });
  };

  useEffect(() => {
    fetchAprendices();
  }, [fichaId]);

  const rowsForTable = aprendices.map(aprendiz => ({
    id: aprendiz.idaprendiz,
    nombre: `${aprendiz.nombres_aprendiz} ${aprendiz.apellidos_aprendiz}`,
    documento: `${aprendiz.abreviatura_tipo_documento} ${aprendiz.documento_aprendiz}`,
    telefono: aprendiz.telefono_aprendiz,
    email: aprendiz.email_aprendiz,
    estado: aprendiz.estado_aprendiz
  }));
  

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "nombre", headerName: "Nombre Completo", width: 200 },
    { field: "documento", headerName: "Documento", width: 160 },
    { field: "telefono", headerName: "Teléfono", width: 130 },
    { field: "email", headerName: "Correo", width: 200 },
    { field: "estado", headerName: "Estado", width: 120 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Editar Aprendiz">
            <IconButton
              color="primary"
              onClick={() => handleAbrirFormulario(params.row)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar Aprendiz">
            <IconButton
              color="error"
              onClick={() => handleEliminarAprendiz(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      
    },
  ];
  

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Componente de navegación jerárquica */}
      <HierarchyNavigation 
        currentLevel="aprendiz" 
        programaId={programaIdFromState}
        programaNombre={nombreProgramaFromState}
        fichaId={fichaId}
        fichaNumero={codigoFichaFromState}
        transitionIn={showAnimation}
      />

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Lista de Aprendices
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Ficha: {codigoFichaFromState} - Programa: {nombreProgramaFromState}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleAbrirFormulario()}
        >
          Agregar Aprendiz
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DinamicTable
          rows={rowsForTable}
          columns={columns}
          pagination={{ page: 0, pageSize: 10 }}
          width={"100%"}
        />
      )}

      {/* Formulario para crear/editar aprendiz */}
      <FormularioAprendiz
        open={openFormulario}
        onClose={handleCerrarFormulario}
        aprendiz={aprendizSeleccionado}
        fichaId={fichaId}
        onAprendizCreated={fetchAprendices}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={confirmDelete.open}
        onClose={handleCancelarEliminacion}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Está seguro de que desea eliminar este aprendiz? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelarEliminacion} color="inherit">
            Cancelar
          </Button>
          <Button onClick={confirmarEliminacion} color="error" variant="contained" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar snackbar={snackbar} handleClose={closeSnackbar} />
    </Paper>
  );
};

export default PanelAprendiz;