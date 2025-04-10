import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Typography,
  IconButton
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import useSnackbar from "../../shared/useSnackbar";

// Interfaces
interface EstadoAprendiz {
  idestado_aprendiz: number;
  estado_aprendiz: string;
}

interface TipoDocumento {
  idtipo_documento: number;
  tipo_documento: string;
}

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
}

interface FormularioAprendizProps {
  open: boolean;
  onClose: () => void;
  aprendiz?: Aprendiz | null;
  fichaId: string;
  onAprendizCreated: () => void;
}

const aprendizVacio: Aprendiz = {
  idaprendiz: null,
  documento_aprendiz: "",
  nombres_aprendiz: "",
  apellidos_aprendiz: "",
  telefono_aprendiz: "",
  email_aprendiz: "",
  password_aprendiz: "",
  ficha_idficha: 0,
  estado_aprendiz_idestado_aprendiz: 1,
  tipo_documento_idtipo_documento: 1
};

const FormularioAprendiz: React.FC<FormularioAprendizProps> = ({
  open,
  onClose,
  aprendiz,
  fichaId,
  onAprendizCreated
}) => {
  const [formData, setFormData] = useState<Aprendiz>(aprendizVacio);
  const [estadosAprendiz, setEstadosAprendiz] = useState<EstadoAprendiz[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { showSnackbar } = useSnackbar();
  const isEditing = Boolean(aprendiz?.idaprendiz);

  // Cargar los estados de aprendiz
  const fetchEstadosAprendiz = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/estado_aprendiz", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.estados)) {
        setEstadosAprendiz(data.estados);
      } else {
        showSnackbar("No se pudieron cargar los estados de aprendiz", "error");
      }
    } catch (err) {
      console.error("Error al obtener estados de aprendiz:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    }
  };

  // Cargar los tipos de documento (simulado, deberás implementar el endpoint real)
  const fetchTiposDocumento = async () => {
    const token = localStorage.getItem("token");
    try {
      // Nota: esta ruta debe existir en tu backend
      const res = await fetch("http://localhost:8000/tipos_documento", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.tipos)) {
        setTiposDocumento(data.tipos);
      } else {
        // Si no hay endpoint, usamos datos de ejemplo
        setTiposDocumento([
          { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
          { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
          { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
          { idtipo_documento: 4, tipo_documento: "Pasaporte" }
        ]);
      }
    } catch (err) {
      console.error("Error al obtener tipos de documento:", err);
      // Si hay error, usamos datos de ejemplo
      setTiposDocumento([
        { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
        { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
        { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
        { idtipo_documento: 4, tipo_documento: "Pasaporte" }
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchEstadosAprendiz(), fetchTiposDocumento()]);
  }, []);

  useEffect(() => {
    if (open) {
      if (aprendiz) {
        setFormData({
          ...aprendiz,
          // Aseguramos que la ficha_idficha sea la correcta
          ficha_idficha: parseInt(fichaId)
        });
      } else {
        setFormData({
          ...aprendizVacio,
          ficha_idficha: parseInt(fichaId)
        });
      }
    }
  }, [open, aprendiz, fichaId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    // Validar campos requeridos
    if (!formData.documento_aprendiz.trim()) {
      showSnackbar("El documento del aprendiz es obligatorio", "error");
      return false;
    }
    if (!formData.nombres_aprendiz.trim()) {
      showSnackbar("El nombre del aprendiz es obligatorio", "error");
      return false;
    }
    if (!formData.apellidos_aprendiz.trim()) {
      showSnackbar("El apellido del aprendiz es obligatorio", "error");
      return false;
    }
    if (!formData.email_aprendiz.trim()) {
      showSnackbar("El correo electrónico es obligatorio", "error");
      return false;
    }
    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email_aprendiz)) {
      showSnackbar("El formato del correo electrónico no es válido", "error");
      return false;
    }
    // Si es un nuevo aprendiz, validar la contraseña
    if (!isEditing && !formData.password_aprendiz.trim()) {
      showSnackbar("La contraseña es obligatoria", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const url = isEditing
        ? `http://localhost:8000/aprendiz/${formData.idaprendiz}`
        : "http://localhost:8000/aprendiz";
      
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (data.success) {
        showSnackbar(
          isEditing
            ? "Aprendiz actualizado exitosamente"
            : "Aprendiz creado exitosamente",
          "success"
        );
        onAprendizCreated();
        onClose();
      } else {
        showSnackbar(data.msg || "Error al guardar el aprendiz", "error");
      }
    } catch (err) {
      console.error("Error al guardar aprendiz:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="formulario-aprendiz-titulo"
    >
      <DialogTitle id="formulario-aprendiz-titulo">
        {isEditing ? "Editar Aprendiz" : "Registrar Nuevo Aprendiz"}
      </DialogTitle>
      <DialogContent>
        {loadingData ? (
          <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="tipo-documento-label">Tipo de Documento</InputLabel>
                <Select
                  labelId="tipo-documento-label"
                  id="tipo_documento_idtipo_documento"
                  name="tipo_documento_idtipo_documento"
                  value={formData.tipo_documento_idtipo_documento}
                  label="Tipo de Documento"
                  onChange={handleSelectChange}
                >
                  {tiposDocumento.map((tipo) => (
                    <MenuItem key={tipo.idtipo_documento} value={tipo.idtipo_documento}>
                      {tipo.tipo_documento}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="documento_aprendiz"
                label="Número de Documento"
                type="text"
                fullWidth
                value={formData.documento_aprendiz}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="nombres_aprendiz"
                label="Nombres"
                type="text"
                fullWidth
                value={formData.nombres_aprendiz}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="apellidos_aprendiz"
                label="Apellidos"
                type="text"
                fullWidth
                value={formData.apellidos_aprendiz}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="telefono_aprendiz"
                label="Teléfono"
                type="text"
                fullWidth
                value={formData.telefono_aprendiz}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                name="email_aprendiz"
                label="Correo Electrónico"
                type="email"
                fullWidth
                value={formData.email_aprendiz}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            {!isEditing && (
              <Grid item xs={12} md={6}>
                <TextField
                  margin="dense"
                  name="password_aprendiz"
                  label="Contraseña"
                  type="password"
                  fullWidth
                  value={formData.password_aprendiz}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="estado-aprendiz-label">Estado del Aprendiz</InputLabel>
                <Select
                  labelId="estado-aprendiz-label"
                  id="estado_aprendiz_idestado_aprendiz"
                  name="estado_aprendiz_idestado_aprendiz"
                  value={formData.estado_aprendiz_idestado_aprendiz}
                  label="Estado del Aprendiz"
                  onChange={handleSelectChange}
                >
                  {estadosAprendiz.map((estado) => (
                    <MenuItem key={estado.idestado_aprendiz} value={estado.idestado_aprendiz}>
                      {estado.estado_aprendiz}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : isEditing ? (
            "Actualizar"
          ) : (
            "Guardar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormularioAprendiz;