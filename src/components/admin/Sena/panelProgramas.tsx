// Mejorado estéticamente
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DinamicTable from "../../shared/dataTable";
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
  IconButton, 
  Tooltip
} from "@mui/material";


import ClassIcon from "@mui/icons-material/Class";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { GridColDef } from "@mui/x-data-grid";
import CustomSnackbar from "../../shared/customSnackbar";
import useSnackbar from "../../shared/useSnackbar";
import HierarchyNavigation from "../../shared/Animation/HierarchyNavigation";

interface Programa {
  idprograma: number;
  codigo_programa: string;
  nombre_programa: string;
  id?: number;
}

const ProgramasPanel: React.FC = () => {
  const navigate = useNavigate();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editando, setEditando] = useState(false);
  const [programaActual, setProgramaActual] = useState<number | null>(null);
  const [nuevoPrograma, setNuevoPrograma] = useState({
    codigo_programa: "",
    nombre_programa: "",
  });

  const [showAnimation, setShowAnimation] = useState(false);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchProgramas = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/programas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.programas)) {
        const dataConIds = data.programas.map((p: Programa) => ({
          ...p,
          id: p.idprograma,
        }));
        setProgramas(dataConIds);
      } else {
        showSnackbar("No se pudieron cargar los programas.", "error");
      }
    } catch (err) {
      console.error("Error en fetchProgramas:", err);
      showSnackbar("Error al conectar con el servidor.", "error");
    }
  };

  useEffect(() => {
    fetchProgramas();
  }, []);

  const handleOpenDialog = (editar = false, programa?: Programa) => {
    if (editar && programa) {
      setEditando(true);
      setProgramaActual(programa.idprograma);
      setNuevoPrograma({
        codigo_programa: programa.codigo_programa,
        nombre_programa: programa.nombre_programa,
      });
    } else {
      setEditando(false);
      setProgramaActual(null);
      setNuevoPrograma({ codigo_programa: "", nombre_programa: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setNuevoPrograma({ codigo_programa: "", nombre_programa: "" });
    setEditando(false);
    setProgramaActual(null);
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoPrograma({ ...nuevoPrograma, [e.target.name]: e.target.value });
  };

  const handleGuardarPrograma = async () => {
    const token = localStorage.getItem("token");
    if (!nuevoPrograma.codigo_programa.trim() || !nuevoPrograma.nombre_programa.trim()) {
      showSnackbar("Todos los campos son obligatorios", "error");
      return;
    }

    try {
      let url = "http://localhost:8000/programas";
      let method = "POST";
      if (editando && programaActual) {
        url = `http://localhost:8000/programas/${programaActual}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoPrograma),
      });

      const result = await res.json();
      if (result.success) {
        showSnackbar(editando ? "Programa actualizado" : "Programa creado", "success");
        fetchProgramas();
        handleCloseDialog();
      } else {
        showSnackbar(result.msg || "Error al guardar el programa", "error");
      }
    } catch (err) {
      console.error("Error al guardar programa:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    }
  };

  const handleEliminar = async (idprograma: number) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("¿Deseas eliminar este programa?")) return;

    try {
      const res = await fetch(`http://localhost:8000/programas/${idprograma}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showSnackbar("Programa eliminado", "success");
        fetchProgramas();
      } else {
        showSnackbar(data.msg || "No se pudo eliminar el programa", "error");
      }
    } catch (error) {
      console.error("Error al eliminar programa:", error);
      showSnackbar("Error al conectar con el servidor", "error");
    }
  };

  const handleAgregarFicha = (programa: Programa) => {
    navigate(`/admin/fichas/${programa.idprograma}`, {
      state: {
        nombrePrograma: programa.nombre_programa,
        codigoPrograma: programa.codigo_programa,
      },
    });
  };

  const columns: GridColDef[] = [
    { field: "idprograma", headerName: "ID", width: 100 },
    { field: "codigo_programa", headerName: "Código", width: 150 },
    { field: "nombre_programa", headerName: "Nombre", width: 300 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 300,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Tooltip title="Agregar Ficha">
            <IconButton color="primary" onClick={() => handleAgregarFicha(params.row)}>
              <ClassIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton color="default" onClick={() => handleOpenDialog(true, params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton color="error" onClick={() => handleEliminar(params.row.idprograma)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    },
  ];

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
        }}
      >
        <HierarchyNavigation currentLevel="programa" transitionIn={showAnimation} />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Gestión de Programas</Typography>
          <Button variant="contained" startIcon={<AddIcon />}  onClick={() => handleOpenDialog()}>
            Agregar programa
          </Button>
        </Box>

        {mensaje && (
          <Typography color="error" mb={2}>
            {mensaje}
          </Typography>
        )}

        <DinamicTable
          rows={programas}
          columns={columns}
          pagination={{ page: 0, pageSize: 8 }}
          width={"100%"}
          height={500}
          enableCheckboxSelection={false}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editando ? "Editar Programa" : "Agregar Programa"}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Código del Programa"
            name="codigo_programa"
            fullWidth
            value={nuevoPrograma.codigo_programa}
            onChange={handleChange}
            margin="dense"
          />
          <TextField
            label="Nombre del Programa"
            name="nombre_programa"
            fullWidth
            value={nuevoPrograma.nombre_programa}
            onChange={handleChange}
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleGuardarPrograma} variant="contained">
            {editando ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar snackbar={snackbar} handleClose={closeSnackbar} />
    </Box>
  );
};

export default ProgramasPanel;
