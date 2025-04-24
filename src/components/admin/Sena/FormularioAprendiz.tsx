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
  Divider,
  Box,
  Paper,
  Alert
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
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
  editando: boolean;
}

// Objeto vacío para inicializar el formulario
const aprendizVacio: Aprendiz = {
  idaprendiz: null,
  documento_aprendiz: "",
  nombres_aprendiz: "",
  apellidos_aprendiz: "",
  telefono_aprendiz: "",
  email_aprendiz: "",
  password_aprendiz: "",
  ficha_idficha: 0,
  estado_aprendiz_idestado_aprendiz: 2, // Por defecto "En Formación"
  tipo_documento_idtipo_documento: 1, // Por defecto "Cédula de Ciudadanía"
};

const FormularioAprendiz: React.FC<FormularioAprendizProps> = ({
  open,
  onClose,
  aprendiz,
  fichaId,
  onAprendizCreated,
  editando
}) => {
  // Estados del componente
  const [formData, setFormData] = useState<Aprendiz>({ ...aprendizVacio });
  const [estadosAprendiz, setEstadosAprendiz] = useState<EstadoAprendiz[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { showSnackbar } = useSnackbar();
  const isEditing = editando && aprendiz !== null;

  // Efecto para inicializar el formulario cuando se abre o cambia el aprendiz seleccionado
  useEffect(() => {
    if (open) {
      if (isEditing && aprendiz) {
        console.log("Editando aprendiz:", aprendiz);
        // Cargar los datos del aprendiz existente
        setFormData({
          ...aprendiz,
          ficha_idficha: Number(fichaId), // Aseguramos que la ficha se mantenga
        });
      } else {
        // Inicializar para nuevo aprendiz
        setFormData({
          ...aprendizVacio,
          ficha_idficha: Number(fichaId),
        });
      }
      // Resetear errores al abrir el formulario
      setFormErrors({});
    }
  }, [open, aprendiz, fichaId, isEditing]);

  // Cargar los estados de aprendiz
  const fetchEstadosAprendiz = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/estado_aprendiz", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        // Intentamos encontrar los datos en alguno de los campos posibles
        if (Array.isArray(data.estados_aprendiz)) {
          setEstadosAprendiz(data.estados_aprendiz);
        } else if (Array.isArray(data.estados)) {
          setEstadosAprendiz(data.estados);
        } else {
          console.error("Formato de respuesta inesperado para estados de aprendiz");
          showSnackbar("No se pudieron cargar los estados del aprendiz", "error");
          setEstadosAprendiz([]);
        }
      } else {
        console.error("Error en la respuesta del servidor:", data);
        showSnackbar("No se pudieron cargar los estados del aprendiz", "error");
        setEstadosAprendiz([]);
      }
    } catch (err) {
      console.error("Error al obtener estados de aprendiz:", err);
      showSnackbar("Error al conectar con el servidor", "error");
      setEstadosAprendiz([]);
    }
  };

  // Cargar los tipos de documento
  const fetchTiposDocumento = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8000/tipoDocumento", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success) {
        // Intentamos encontrar los datos en alguno de los campos posibles
        if (Array.isArray(data.tipoDocumento)) {
          setTiposDocumento(data.tipoDocumento);
        } else if (Array.isArray(data.tipos_documento)) {
          setTiposDocumento(data.tipos_documento);
        } else if (Array.isArray(data.data)) {
          setTiposDocumento(data.data);
        } else {
          // No se encontraron datos en un formato reconocible
          console.error("Formato de respuesta inesperado para tipos de documento");
          showSnackbar("No se pudieron cargar los tipos de documento", "error");
          setTiposDocumento([]);
        }
      } else {
        console.error("Error en la respuesta del servidor:", data);
        showSnackbar("No se pudieron cargar los tipos de documento", "error");
        setTiposDocumento([]);
      }
    } catch (err) {
      console.error("Error al obtener tipos de documento:", err);
      showSnackbar("Error al conectar con el servidor", "error");
      setTiposDocumento([]);
    } finally {
      setLoadingData(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (open) {
      console.log("🔄 Formulario abierto, cargando datos iniciales...");
      setLoadingData(true);
      
      // Cargar tipos de documento y estados
      Promise.all([fetchEstadosAprendiz(), fetchTiposDocumento()])
        .catch(err => {
          console.error("Error al cargar datos iniciales:", err);
        })
        .finally(() => {
          setLoadingData(false);
        });
    }
  }, [open]);

  // Limpiar el formulario cuando se cierra
  useEffect(() => {
    if (!open) {
      console.log("Formulario cerrado, limpiando datos");
      setFormData(aprendizVacio);
      setFormErrors({});
    }
  }, [open]);

  // Manejadores de cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error específico si existe
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  // Validación del formulario
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Validar campos requeridos
    if (!formData.documento_aprendiz.trim()) {
      errors.documento_aprendiz = "El documento del aprendiz es obligatorio";
    }
    
    if (!formData.nombres_aprendiz.trim()) {
      errors.nombres_aprendiz = "El nombre del aprendiz es obligatorio";
    }
    
    if (!formData.apellidos_aprendiz.trim()) {
      errors.apellidos_aprendiz = "El apellido del aprendiz es obligatorio";
    }
    
    if (!formData.email_aprendiz.trim()) {
      errors.email_aprendiz = "El correo electrónico es obligatorio";
    } else {
      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email_aprendiz)) {
        errors.email_aprendiz = "El formato del correo electrónico no es válido";
      }
    }
    
    // Si es un nuevo aprendiz, validar la contraseña
    if (!isEditing && !formData.password_aprendiz.trim()) {
      errors.password_aprendiz = "La contraseña es obligatoria";
    }
    
    // Actualizar estado de errores
    setFormErrors(errors);
    
    // Devolver true si no hay errores
    return Object.keys(errors).length === 0;
  };

  // Guardar los cambios (crear o actualizar)
  const handleGuardar = async () => {
    // Validar formulario
    if (!validateForm()) {
      showSnackbar("Por favor, corrija los errores en el formulario", "error");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      let url, method;
      
      if (isEditing) {
        // Actualizar aprendiz existente
        url = `http://localhost:8000/aprendiz/${aprendiz?.idaprendiz}`;
        method = "PUT";
      } else {
        // Crear nuevo aprendiz
        url = "http://localhost:8000/aprendiz";
        method = "POST";
      }

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
        onAprendizCreated(); // Actualizar la lista
        onClose(); // Cerrar el formulario
      } else {
        showSnackbar(
          data.msg || "Error al guardar el aprendiz",
          "error"
        );
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
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1 
      }}>
        <AccountCircleIcon /> 
        {isEditing ? "Editar Aprendiz" : "Crear Nuevo Aprendiz"}
      </DialogTitle>
      
      <DialogContent dividers>
        {loadingData ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {Object.keys(formErrors).length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Por favor, corrija los errores señalados para continuar.
              </Alert>
            )}
            
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Información Personal
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {/* Tipo de documento */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="tipo-documento-label">Tipo de Documento</InputLabel>
                    <Select
                      labelId="tipo-documento-label"
                      id="tipo-documento"
                      name="tipo_documento_idtipo_documento"
                      value={formData.tipo_documento_idtipo_documento.toString()}
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

                {/* Número de documento */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Número de Documento"
                    name="documento_aprendiz"
                    value={formData.documento_aprendiz}
                    onChange={handleChange}
                    error={!!formErrors.documento_aprendiz}
                    helperText={formErrors.documento_aprendiz}
                  />
                </Grid>

                {/* Nombres */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Nombres"
                    name="nombres_aprendiz"
                    value={formData.nombres_aprendiz}
                    onChange={handleChange}
                    error={!!formErrors.nombres_aprendiz}
                    helperText={formErrors.nombres_aprendiz}
                  />
                </Grid>

                {/* Apellidos */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Apellidos"
                    name="apellidos_aprendiz"
                    value={formData.apellidos_aprendiz}
                    onChange={handleChange}
                    error={!!formErrors.apellidos_aprendiz}
                    helperText={formErrors.apellidos_aprendiz}
                  />
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                Información de Contacto
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {/* Teléfono */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="telefono_aprendiz"
                    value={formData.telefono_aprendiz}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Email */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    label="Correo Electrónico"
                    name="email_aprendiz"
                    type="email"
                    value={formData.email_aprendiz}
                    onChange={handleChange}
                    error={!!formErrors.email_aprendiz}
                    helperText={formErrors.email_aprendiz}
                  />
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
                Acceso y Estado
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {/* Contraseña */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required={!isEditing}
                    label="Contraseña"
                    name="password_aprendiz"
                    type="password"
                    value={formData.password_aprendiz}
                    onChange={handleChange}
                    error={!!formErrors.password_aprendiz}
                    helperText={isEditing 
                      ? "Dejar en blanco para mantener la actual" 
                      : formErrors.password_aprendiz || ""}
                  />
                </Grid>

                {/* Estado */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="estado-aprendiz-label">Estado</InputLabel>
                    <Select
                      labelId="estado-aprendiz-label"
                      id="estado-aprendiz"
                      name="estado_aprendiz_idestado_aprendiz"
                      value={formData.estado_aprendiz_idestado_aprendiz.toString()}
                      label="Estado"
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
            </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          color="inherit" 
          startIcon={<CancelIcon />}
          sx={{ borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          disabled={loading || loadingData}
          sx={{ borderRadius: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormularioAprendiz;