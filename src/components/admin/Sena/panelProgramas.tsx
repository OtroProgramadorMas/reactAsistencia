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
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import CustomSnackbar from "../../shared/customSnackbar";
import useSnackbar from "../../shared/useSnackbar";

// Definimos el tipo del programa
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
  
  // Usamos nuestro hook personalizado para el Snackbar
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const fetchProgramas = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/programas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Respuesta del servidor:", data);

      if (data.success && Array.isArray(data.programas)) {
        const dataConIds = data.programas.map((p: Programa) => ({
          ...p,
          id: p.idprograma,
        }));
        setProgramas(dataConIds);
      } else {
        setMensaje("No se pudieron cargar los programas.");
        showSnackbar("No se pudieron cargar los programas.", "error");
      }
    } catch (err) {
      console.error("Error en fetchProgramas:", err);
      setMensaje("Error al conectar con el servidor.");
      showSnackbar("Error al conectar con el servidor.", "error");
    }
  };

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
    setNuevoPrograma({
      ...nuevoPrograma,
      [e.target.name]: e.target.value,
    });
  };

  const handleGuardarPrograma = async () => {
    const token = localStorage.getItem("token");

    // Validaciones básicas
    if (!nuevoPrograma.codigo_programa.trim() || !nuevoPrograma.nombre_programa.trim()) {
      showSnackbar("Todos los campos son obligatorios", "error");
      return;
    }

    try {
      let url = "http://localhost:8000/programas";
      let method = "POST";

      // Si estamos editando, cambiamos la URL y el método
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
        showSnackbar(
          editando ? "Programa actualizado exitosamente" : "Programa creado exitosamente",
          "success"
        );
        fetchProgramas(); // recarga tabla
        handleCloseDialog(); // cierra formulario
      } else {
        showSnackbar(
          result.msg || "Error al guardar el programa",
          "error"
        );
      }
    } catch (err) {
      console.error("Error al guardar programa:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    }
  };

  const handleEliminar = async (idprograma: number) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("¿Estás seguro de que deseas eliminar este programa?")) return;

    try {
      const res = await fetch(`http://localhost:8000/programas/${idprograma}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        showSnackbar("Programa eliminado exitosamente", "success");
        fetchProgramas();
      } else {
        showSnackbar(data.msg || "No se pudo eliminar el programa", "error");
      }
    } catch (error) {
      console.error("Error al eliminar programa:", error);
      showSnackbar("Error al conectar con el servidor", "error");
    }
  };
<<<<<<< HEAD
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Modificamos la función para usar navigate en lugar de window.location.href
=======

>>>>>>> 3d644b83bf87d52f728c50980de757aafa8a58ad
  const handleAgregarFicha = (programa: Programa) => {
    console.log("Agregar ficha para programa:", programa);
    navigate(`/admin/fichas/${programa.idprograma}?nombre=${encodeURIComponent(programa.nombre_programa)}&codigo=${encodeURIComponent(programa.codigo_programa)}`);
  };

  useEffect(() => {
    fetchProgramas();
  }, []);

  const columns: GridColDef[] = [
    { field: "idprograma", headerName: "ID", width: 100 },
    { field: "codigo_programa", headerName: "Código", width: 150 },
    { field: "nombre_programa", headerName: "Nombre", width: 300 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 300,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleAgregarFicha(params.row)}
          >
            Ficha
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
            onClick={() => handleEliminar(params.row.idprograma)}
          >
            Eliminar
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Programas registrados</Typography>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
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
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editando ? "Editar programa" : "Agregar nuevo programa"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Código del programa"
            name="codigo_programa"
            fullWidth
            value={nuevoPrograma.codigo_programa}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Nombre del programa"
            name="nombre_programa"
            fullWidth
            value={nuevoPrograma.nombre_programa}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleGuardarPrograma} variant="contained">
            {editando ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nuestro componente Snackbar reutilizable */}
      <CustomSnackbar 
        snackbar={snackbar} 
        handleClose={closeSnackbar} 
      />
    </Box>
  );
};

export default ProgramasPanel;