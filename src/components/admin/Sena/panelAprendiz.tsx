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
  DialogActions
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import DinamicTable from "../../shared/dataTable";
import CustomSnackbar from "../../shared/customSnackbar";
import useSnackbar from "../../shared/useSnackbar";
import FormularioAprendiz from "./FormularioAprendiz ";

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
  id?: number; // para DataGrid
}

interface AprendizPanelProps {
  fichaId: string;
  codigoFicha: string;
  nombrePrograma: string;
}

const PanelAprendiz: React.FC<AprendizPanelProps> = ({ fichaId, codigoFicha, nombrePrograma }) => {
  const navigate = useNavigate();
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [openFormulario, setOpenFormulario] = useState(false);
  const [aprendizSeleccionado, setAprendizSeleccionado] = useState<Aprendiz | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{open: boolean, id: number | null}>({
    open: false, 
    id: null
  });

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
          id: a.idaprendiz // Asignamos el ID para DataGrid
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

  const handleVolver = () => {
    navigate(-1);
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

  const columns: GridColDef[] = [
    { field: "idaprendiz", headerName: "ID", width: 70 },
    { field: "documento_aprendiz", headerName: "Documento", width: 130 },
    { field: "nombres_aprendiz", headerName: "Nombres", width: 150 },
    { field: "apellidos_aprendiz", headerName: "Apellidos", width: 150 },
    { field: "telefono_aprendiz", headerName: "Teléfono", width: 130 },
    { field: "email_aprendiz", headerName: "Correo", width: 200 },
    { field: "nombre_estado_aprendiz", headerName: "Estado", width: 120 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => handleAbrirFormulario(params.row as Aprendiz)}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleEliminarAprendiz(params.row.idaprendiz)}
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
          Volver
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Lista de Aprendices
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Ficha: {codigoFicha} - Programa: {nombrePrograma}
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
          rows={aprendices}
          columns={columns}
          pagination={{ page: 0, pageSize: 10 }}
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