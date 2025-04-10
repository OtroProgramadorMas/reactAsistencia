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
  Snackbar,
  Alert,
  Paper,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { GridColDef } from "@mui/x-data-grid";
import DinamicTable from "../../shared/dataTable";
import { useNavigate } from "react-router-dom";

// Interfaz para el aprendiz
interface Aprendiz {
  idaprendiz?: number;
  nombre: string;
  apellido: string;
  tipo_documento: string;
  numero_documento: string;
  correo: string;
  telefono: string;
  ficha_idficha: number;
  id?: number; // Para DataGrid
}

interface PanelAprendizProps {
  fichaId: string | null;
  codigoFicha: string;
  nombrePrograma: string;
}

const PanelAprendiz: React.FC<PanelAprendizProps> = ({ fichaId, codigoFicha, nombrePrograma }) => {
  const navigate = useNavigate();
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editando, setEditando] = useState(false);
  const [aprendizActual, setAprendizActual] = useState<number | null>(null);
  const [nuevoAprendiz, setNuevoAprendiz] = useState({
    nombre: "",
    apellido: "",
    tipo_documento: "CC",
    numero_documento: "",
    correo: "",
    telefono: "",
    ficha_idficha: fichaId
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const [archivoExcel, setArchivoExcel] = useState<File | null>(null);

  const fetchAprendices = async () => {
    if (!fichaId) return;
    
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
        // Procesamos los datos para asegurar que cada aprendiz tenga un id
        const aprendicesConIds = data.aprendices.map((a: any) => ({
          ...a,
          id: a.idaprendiz || Math.random(), // Si no hay idaprendiz, generamos un id único
          nombre_completo: `${a.nombre} ${a.apellido}`
        }));
        setAprendices(aprendicesConIds);
      } else {
        mostrarSnackbar("No se pudieron cargar los aprendices", "error");
      }
    } catch (err) {
      console.error("Error en fetchAprendices:", err);
      mostrarSnackbar("Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    // Volver a la página anterior
    navigate(-1);
  };

  const handleOpenDialog = (editar = false, aprendiz?: Aprendiz) => {
    if (editar && aprendiz) {
      setEditando(true);
      setAprendizActual(aprendiz.idaprendiz || null);
      setNuevoAprendiz({
        nombre: aprendiz.nombre || '',
        apellido: aprendiz.apellido || '',
        tipo_documento: aprendiz.tipo_documento || 'CC',
        numero_documento: aprendiz.numero_documento || '',
        correo: aprendiz.correo || '',
        telefono: aprendiz.telefono || '',
        ficha_idficha: fichaId
      });
    } else {
      setEditando(false);
      setAprendizActual(null);
      setNuevoAprendiz({
        nombre: "",
        apellido: "",
        tipo_documento: "CC",
        numero_documento: "",
        correo: "",
        telefono: "",
        ficha_idficha: fichaId
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    
    setNuevoAprendiz({
      ...nuevoAprendiz,
      [name]: value,
    });
  };

  const mostrarSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleGuardarAprendiz = async () => {
    const token = localStorage.getItem("token");

    // Validaciones básicas
    if (!nuevoAprendiz.nombre.trim() || !nuevoAprendiz.apellido.trim() || 
        !nuevoAprendiz.numero_documento.trim()) {
      mostrarSnackbar("Los campos nombre, apellido y documento son obligatorios", "error");
      return;
    }

    if (nuevoAprendiz.correo && !validateEmail(nuevoAprendiz.correo)) {
      mostrarSnackbar("El formato del correo electrónico no es válido", "error");
      return;
    }

    try {
      let url = "http://localhost:8000/aprendices";
      let method = "POST";

      // Si estamos editando, cambiamos la URL y el método
      if (editando && aprendizActual) {
        url = `http://localhost:8000/aprendices/${aprendizActual}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoAprendiz),
      });

      const result = await res.json();
      if (result.success) {
        mostrarSnackbar(
          editando ? "Aprendiz actualizado exitosamente" : "Aprendiz creado exitosamente",
          "success"
        );
        fetchAprendices(); // recarga tabla
        handleCloseDialog(); // cierra formulario
      } else {
        mostrarSnackbar(
          result.msg || "Error al guardar el aprendiz",
          "error"
        );
      }
    } catch (err) {
      console.error("Error al guardar aprendiz:", err);
      mostrarSnackbar("Error al conectar con el servidor", "error");
    }
  };
///////////////////////////////////

  const handleEliminar = async (idaprendiz: number) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("¿Estás seguro de que deseas eliminar este aprendiz?")) return;

    try {
      const res = await fetch(`http://localhost:8000/aprendices/${idaprendiz}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        mostrarSnackbar("Aprendiz eliminado exitosamente", "success");
        fetchAprendices();
      } else {
        mostrarSnackbar(data.msg || "No se pudo eliminar el aprendiz", "error");
      }
    } catch (error) {
      console.error("Error al eliminar aprendiz:", error);
      mostrarSnackbar("Error al conectar con el servidor", "error");
    }
  };

  useEffect(() => {
    if (fichaId) {
      fetchAprendices();
    }
  }, [fichaId]);
////////////////////////////////////////////////////////////////
  // NUEVO: Funciones para Excel
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoExcel(file);
    }
  };

  const handleUploadExcel = async () => {
    if (!archivoExcel) {
      mostrarSnackbar("Por favor selecciona un archivo Excel", "warning");
      return;
    }
  
    const formData = new FormData();
    formData.append("excel", archivoExcel);
  
    const token = localStorage.getItem("token"); // Asegúrate de que esté guardado correctamente
  
    try {
      const res = await fetch("http://localhost:8000/upload-excel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ← Aquí vuelve el token
        },
        body: formData,
      });
  
      const result = await res.json();
      if (res.ok) {
        mostrarSnackbar("Excel cargado correctamente", "success");
        fetchAprendices();
        setArchivoExcel(null); // limpia
      } else {
        mostrarSnackbar(result.message || "Error al cargar Excel", "error");
      }
    } catch (err) {
      console.error("Error al subir Excel:", err);
      mostrarSnackbar("Error al conectar con el servidor", "error");
    }
  };
  
  
  useEffect(() => {
    if (fichaId) {
      fetchAprendices();
    }
  }, [fichaId]);

  const columns: GridColDef[] = [
    { field: "nombre", headerName: "Nombre", width: 150 },
    { field: "apellido", headerName: "Apellido", width: 150 },
    { field: "tipo_documento", headerName: "Tipo Doc.", width: 100 },
    { field: "numero_documento", headerName: "Número Documento", width: 150 },
    { field: "correo", headerName: "Correo", width: 200 },
    { field: "telefono", headerName: "Teléfono", width: 120 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 200,
      renderCell: (params) => (
        <Box display="flex" gap={1}>
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
            onClick={() => handleEliminar(params.row.idaprendiz)}
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
        <Typography variant="h4" component="h1" gutterBottom>
          Aprendices de la Ficha: {codigoFicha}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Programa: {nombrePrograma}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          ID de la ficha: {fichaId}
        </Typography>
      </Box>

      <Box display="flex" justifyContent="space-between" mb={3} alignItems="center">
        <Typography variant="h6">Aprendices registrados</Typography>
        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={() => handleOpenDialog()}>
            Agregar nuevo aprendiz
          </Button>
          <Button
            variant="contained"
            component="label"
            color="secondary"
          >
            Cargar Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          <Button
            variant="outlined"
            onClick={handleUploadExcel}
            disabled={!archivoExcel}
          >
            Subir archivo
          </Button>
        </Box>
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
          loading={loading}
        />
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editando ? "Editar aprendiz" : "Agregar nuevo aprendiz"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre"
                name="nombre"
                fullWidth
                value={nuevoAprendiz.nombre}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Apellido"
                name="apellido"
                fullWidth
                value={nuevoAprendiz.apellido}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Tipo de Documento</InputLabel>
                <Select
                  name="tipo_documento"
                  value={nuevoAprendiz.tipo_documento}
                  onChange={handleChange}
                  label="Tipo de Documento"
                >
                  <MenuItem value="CC">Cédula de Ciudadanía</MenuItem>
                  <MenuItem value="TI">Tarjeta de Identidad</MenuItem>
                  <MenuItem value="CE">Cédula de Extranjería</MenuItem>
                  <MenuItem value="PASAPORTE">Pasaporte</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                label="Número de Documento"
                name="numero_documento"
                fullWidth
                value={nuevoAprendiz.numero_documento}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Correo Electrónico"
                name="correo"
                type="email"
                fullWidth
                value={nuevoAprendiz.correo}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Teléfono"
                name="telefono"
                fullWidth
                value={nuevoAprendiz.telefono}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleGuardarAprendiz} variant="contained" color="primary">
            {editando ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default PanelAprendiz;