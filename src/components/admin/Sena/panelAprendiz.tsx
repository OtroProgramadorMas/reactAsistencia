import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  IconButton,
  Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useLocation } from "react-router-dom";
import DinamicTable from "../../shared/dataTable";
import CustomSnackbar from "../../shared/customSnackbar";
import useSnackbar from "../../shared/useSnackbar";
import FormularioAprendiz from "./FormularioAprendiz";
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
  const location = useLocation();
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();
  const [openFormulario, setOpenFormulario] = useState(false);
  const [aprendizSeleccionado, setAprendizSeleccionado] = useState<Aprendiz | null>(null);
  
  // Estado para la animación
  const [showAnimation, setShowAnimation] = useState(false);
  // Estado para controlar si estamos en modo edición
  const [editando, setEditando] = useState(false);
  
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
      console.log("Editando aprendiz:", aprendiz);
      setAprendizSeleccionado(aprendiz);
      setEditando(true);
    } else {
      console.log("Creando nuevo aprendiz");
      setAprendizSeleccionado(null);
      setEditando(false);
    }
    setOpenFormulario(true);
  };

  const handleCerrarFormulario = () => {
    setOpenFormulario(false);
    setAprendizSeleccionado(null);
    setEditando(false);
  };

  const handleEliminar = async (id: number) => {
    const token = localStorage.getItem("token");
    
    // Utilizamos confirm como en panelProgramas en lugar del Dialog personalizado
    if (!window.confirm("¿Deseas eliminar este aprendiz? Esta acción no se puede deshacer.")) return;
    
    try {
      const res = await fetch(`http://localhost:8000/aprendiz/${id}`, {
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
    }
  };

  useEffect(() => {
    fetchAprendices();
  }, [fichaId]);

  const rowsForTable = aprendices.map(aprendiz => ({
    id: aprendiz.idaprendiz,
    idaprendiz: aprendiz.idaprendiz,
    nombre: `${aprendiz.nombres_aprendiz} ${aprendiz.apellidos_aprendiz}`,
    documento: `${aprendiz.abreviatura_tipo_documento || ''} ${aprendiz.documento_aprendiz}`,
    telefono: aprendiz.telefono_aprendiz,
    email: aprendiz.email_aprendiz,
    estado: aprendiz.estado_aprendiz,
    // Guardamos todos los campos para cuando necesitemos editar
    documento_aprendiz: aprendiz.documento_aprendiz,
    nombres_aprendiz: aprendiz.nombres_aprendiz,
    apellidos_aprendiz: aprendiz.apellidos_aprendiz,
    telefono_aprendiz: aprendiz.telefono_aprendiz,
    email_aprendiz: aprendiz.email_aprendiz, 
    password_aprendiz: aprendiz.password_aprendiz,
    ficha_idficha: aprendiz.ficha_idficha,
    estado_aprendiz_idestado_aprendiz: aprendiz.estado_aprendiz_idestado_aprendiz,
    tipo_documento_idtipo_documento: aprendiz.tipo_documento_idtipo_documento,
    abreviatura_tipo_documento: aprendiz.abreviatura_tipo_documento
  }));
  
  const columns: GridColDef[] = [
    { field: "idaprendiz", headerName: "ID", width: 70 },
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
              onClick={() => handleEliminar(params.row.idaprendiz)}
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
          height={500}
          enableCheckboxSelection={false}
        />
      )}

      {/* Formulario para crear/editar aprendiz */}
      <FormularioAprendiz
        open={openFormulario}
        onClose={handleCerrarFormulario}
        aprendiz={aprendizSeleccionado}
        fichaId={fichaId}
        onAprendizCreated={fetchAprendices}
        editando={editando}  // Pasamos la bandera de edición al formulario
      />

      <CustomSnackbar snackbar={snackbar} handleClose={closeSnackbar} />
    </Paper>
  );
};

export default PanelAprendiz;