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
  estado_aprendiz_idestado_aprendiz: 0,
  tipo_documento_idtipo_documento: 0
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
  
  // Mejorar la verificación del modo de edición
  const isEditing = Boolean(aprendiz && aprendiz.idaprendiz);

  // Función para obtener datos del aprendiz directamente del servidor
  const fetchAprendizById = async (id: number) => {
    const token = localStorage.getItem("token");
    try {
      console.log(`Obteniendo datos del aprendiz con ID: ${id}`);
      const res = await fetch(`http://localhost:8000/aprendiz/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.aprendiz) {
        console.log("✅ Datos del aprendiz obtenidos:", data.aprendiz);
        
        // Actualizar el formulario con los datos del aprendiz
        setFormData({
          ...data.aprendiz,
          // Asegurar que los campos numéricos sean realmente números
          idaprendiz: Number(data.aprendiz.idaprendiz),
          ficha_idficha: Number(data.aprendiz.ficha_idficha || fichaId),
          estado_aprendiz_idestado_aprendiz: Number(data.aprendiz.estado_aprendiz_idestado_aprendiz || 0),
          tipo_documento_idtipo_documento: Number(data.aprendiz.tipo_documento_idtipo_documento || 0)
        });
      } else {
        showSnackbar("No se pudo obtener la información del aprendiz", "error");
      }
    } catch (err) {
      console.error("Error al obtener datos del aprendiz:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    }
  };

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
      
      // Verificamos la estructura de la respuesta
      if (data.success) {
        // Verificamos si los datos están en estados_aprendiz o estados
        if (Array.isArray(data.estados_aprendiz)) {
          setEstadosAprendiz(data.estados_aprendiz);
        } else if (Array.isArray(data.estados)) {
          setEstadosAprendiz(data.estados);
        } else {
          // Si no encontramos los datos en ninguno de los campos esperados
          showSnackbar("Formato de respuesta inesperado para estados de aprendiz", "error");
          // Usamos datos de ejemplo
          setEstadosAprendiz([
            { idestado_aprendiz: 1, estado_aprendiz: "Activo" },
            { idestado_aprendiz: 2, estado_aprendiz: "Inactivo" }
          ]);
        }
      } else {
        showSnackbar("No se pudieron cargar los estados de aprendiz", "error");
        // Usamos datos de ejemplo
        setEstadosAprendiz([
          { idestado_aprendiz: 1, estado_aprendiz: "Activo" },
          { idestado_aprendiz: 2, estado_aprendiz: "Inactivo" }
        ]);
      }
    } catch (err) {
      console.error("Error al obtener estados de aprendiz:", err);
      showSnackbar("Error al conectar con el servidor", "error");
      // Usamos datos de ejemplo
      setEstadosAprendiz([
        { idestado_aprendiz: 1, estado_aprendiz: "Activo" },
        { idestado_aprendiz: 2, estado_aprendiz: "Inactivo" }
      ]);
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
      
      // Verificamos la estructura de la respuesta
      if (data.success) {
        // Verificamos si los datos están en tipoDocumento o en otro campo
        if (Array.isArray(data.tipoDocumento)) {
          setTiposDocumento(data.tipoDocumento);
        } else if (Array.isArray(data.tipos_documento)) {
          setTiposDocumento(data.tipos_documento);
        } else if (Array.isArray(data.data)) {
          setTiposDocumento(data.data);
        } else {
          // Si no encontramos los datos en ninguno de los campos esperados
          console.warn("Formato de respuesta inesperado para tipos de documento");
          // Usamos datos de ejemplo
          setTiposDocumento([
            { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
            { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
            { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
            { idtipo_documento: 4, tipo_documento: "Pasaporte" }
          ]);
        }
      } else {
        // Si no hay éxito en la respuesta, usamos datos de ejemplo
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

  // Limpiar el formulario cuando se cierra
  useEffect(() => {
    if (!open) {
      console.log("Formulario cerrado, limpiando datos");
      setFormData(aprendizVacio);
    }
  }, [open]);

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

  // Efecto para cargar datos del aprendiz cuando estamos en modo edición
  useEffect(() => {
    if (open && aprendiz && aprendiz.idaprendiz) {
      console.log("🔍 Detectado modo edición para aprendiz con ID:", aprendiz.idaprendiz);
      
      // Opción más segura: cargar datos del aprendiz directamente del backend
      fetchAprendizById(Number(aprendiz.idaprendiz));
      
      // Alternativa: usar datos proporcionados por el componente padre
      
      console.log("📝 Usando datos del aprendiz proporcionados:", aprendiz);
      
      setFormData({
        ...aprendiz,
        idaprendiz: Number(aprendiz.idaprendiz),
        ficha_idficha: Number(aprendiz.ficha_idficha || fichaId),
        estado_aprendiz_idestado_aprendiz: Number(aprendiz.estado_aprendiz_idestado_aprendiz || 0),
        tipo_documento_idtipo_documento: Number(aprendiz.tipo_documento_idtipo_documento || 0)
      });
      
    } else if (open && !aprendiz) {
      // Para un nuevo aprendiz, establecemos valores predeterminados
      console.log("📝 Inicializando formulario para nuevo aprendiz");
      
      // Esperamos a que los datos estén cargados antes de establecer los valores predeterminados
      if (estadosAprendiz.length > 0 && tiposDocumento.length > 0) {
        const defaultEstadoId = estadosAprendiz[0].idestado_aprendiz;
        const defaultTipoDocId = tiposDocumento[0].idtipo_documento;
        
        setFormData({
          ...aprendizVacio,
          ficha_idficha: parseInt(fichaId),
          estado_aprendiz_idestado_aprendiz: defaultEstadoId,
          tipo_documento_idtipo_documento: defaultTipoDocId,
        });
      }
    }
  }, [open, aprendiz, estadosAprendiz, tiposDocumento]);

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
      [name]: Number(value)
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
      // Verificar explícitamente si estamos en modo de edición
      console.log("Modo de edición:", isEditing);
      console.log("ID del aprendiz:", formData.idaprendiz);
      
      // Construcción explícita de URL para edición
      let url = "";
      if (isEditing && formData.idaprendiz) {
        url = `http://localhost:8000/aprendiz/${formData.idaprendiz}`;
        console.log("URL de actualización:", url);
      } else {
        url = "http://localhost:8000/aprendiz";
        console.log("URL de creación:", url);
      }
      
      const method = isEditing ? "PUT" : "POST";
      console.log("Método HTTP:", method);
      
      // Crear una copia profunda de los datos para no modificar el estado directamente
      let dataToSend = JSON.parse(JSON.stringify(formData));
      
      // Si estamos creando, eliminar el idaprendiz
      if (!isEditing) {
        delete dataToSend.idaprendiz;
      }
      
      // Asegurar que todos los IDs sean números
      dataToSend = {
        ...dataToSend,
        ficha_idficha: Number(dataToSend.ficha_idficha),
        estado_aprendiz_idestado_aprendiz: Number(dataToSend.estado_aprendiz_idestado_aprendiz),
        tipo_documento_idtipo_documento: Number(dataToSend.tipo_documento_idtipo_documento)
      };
      
      console.log("📤 Datos enviados al backend:", {
        url,
        method,
        isEditing,
        dataToSend,
      });

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });
      
      console.log("Respuesta del servidor:", {
        status: res.status,
        statusText: res.statusText,
      });

      // Mejorar el manejo de respuestas
      const responseText = await res.text();
      console.log("Texto de respuesta:", responseText);
      
      let data;
      
      try {
        // Intentar analizar la respuesta como JSON
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Error al parsear respuesta:", e);
        showSnackbar("Error: Respuesta del servidor no es JSON válido", "error");
        setLoading(false);
        return;
      }
      
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
        // Mostrar información detallada sobre el error
        console.error("Error del servidor:", data);
        showSnackbar(
          data.msg || data.error || data.message || "Error al guardar el aprendiz", 
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
                  value={formData.tipo_documento_idtipo_documento || ""}
                  label="Tipo de Documento"
                  onChange={handleSelectChange}
                  disabled={tiposDocumento.length === 0}
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
                  value={formData.estado_aprendiz_idestado_aprendiz || ""}
                  label="Estado del Aprendiz"
                  onChange={handleSelectChange}
                  disabled={estadosAprendiz.length === 0}
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

// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   CircularProgress,
//   Typography,
//   IconButton
// } from "@mui/material";
// import { SelectChangeEvent } from "@mui/material/Select";
// import useSnackbar from "../../shared/useSnackbar";

// // Interfaces
// interface EstadoAprendiz {
//   idestado_aprendiz: number;
//   estado_aprendiz: string;
// }

// interface TipoDocumento {
//   idtipo_documento: number;
//   tipo_documento: string;
// }

// interface Aprendiz {
//   idaprendiz: number | null;
//   documento_aprendiz: string;
//   nombres_aprendiz: string;
//   apellidos_aprendiz: string;
//   telefono_aprendiz: string;
//   email_aprendiz: string;
//   password_aprendiz: string;
//   ficha_idficha: number;
//   estado_aprendiz_idestado_aprendiz: number;
//   tipo_documento_idtipo_documento: number;
// }

// interface FormularioAprendizProps {
//   open: boolean;
//   onClose: () => void;
//   aprendiz?: Aprendiz | null;
//   fichaId: string;
//   onAprendizCreated: () => void;
// }

// const aprendizVacio: Aprendiz = {
//   idaprendiz: null,
//   documento_aprendiz: "",
//   nombres_aprendiz: "",
//   apellidos_aprendiz: "",
//   telefono_aprendiz: "",
//   email_aprendiz: "",
//   password_aprendiz: "",
//   ficha_idficha: 0,
//   estado_aprendiz_idestado_aprendiz: 0,
//   tipo_documento_idtipo_documento: 0
// };

// const FormularioAprendiz: React.FC<FormularioAprendizProps> = ({
//   open,
//   onClose,
//   aprendiz,
//   fichaId,
//   onAprendizCreated
// }) => {
//   const [formData, setFormData] = useState<Aprendiz>(aprendizVacio);
//   const [estadosAprendiz, setEstadosAprendiz] = useState<EstadoAprendiz[]>([]);
//   const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingData, setLoadingData] = useState(true);
//   const { showSnackbar } = useSnackbar();
  
//   // Mejorar la verificación del modo de edición
//   const isEditing = Boolean(aprendiz && aprendiz.idaprendiz);

//   // Cargar los estados de aprendiz
//   const fetchEstadosAprendiz = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch("http://localhost:8000/estado_aprendiz", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       if (!res.ok) {
//         throw new Error(`Error HTTP: ${res.status}`);
//       }
      
//       const data = await res.json();
      
//       // Verificamos la estructura de la respuesta
//       if (data.success) {
//         // Verificamos si los datos están en estados_aprendiz o estados
//         if (Array.isArray(data.estados_aprendiz)) {
//           setEstadosAprendiz(data.estados_aprendiz);
//         } else if (Array.isArray(data.estados)) {
//           setEstadosAprendiz(data.estados);
//         } else {
//           // Si no encontramos los datos en ninguno de los campos esperados
//           showSnackbar("Formato de respuesta inesperado para estados de aprendiz", "error");
//           // Usamos datos de ejemplo
//           setEstadosAprendiz([
//             { idestado_aprendiz: 1, estado_aprendiz: "Activo" },
//             { idestado_aprendiz: 2, estado_aprendiz: "Inactivo" }
//           ]);
//         }
//       } else {
//         showSnackbar("No se pudieron cargar los estados de aprendiz", "error");
//         // Usamos datos de ejemplo
//         setEstadosAprendiz([
//           { idestado_aprendiz: 1, estado_aprendiz: "Activo" },
//           { idestado_aprendiz: 2, estado_aprendiz: "Inactivo" }
//         ]);
//       }
//     } catch (err) {
//       console.error("Error al obtener estados de aprendiz:", err);
//       showSnackbar("Error al conectar con el servidor", "error");
//       // Usamos datos de ejemplo
//       setEstadosAprendiz([
//         { idestado_aprendiz: 1, estado_aprendiz: "Activo" },
//         { idestado_aprendiz: 2, estado_aprendiz: "Inactivo" }
//       ]);
//     }
//   };

//   // Cargar los tipos de documento
//   const fetchTiposDocumento = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch("http://localhost:8000/tipoDocumento", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       if (!res.ok) {
//         throw new Error(`Error HTTP: ${res.status}`);
//       }
      
//       const data = await res.json();
      
//       // Verificamos la estructura de la respuesta
//       if (data.success) {
//         // Verificamos si los datos están en tipoDocumento o en otro campo
//         if (Array.isArray(data.tipoDocumento)) {
//           setTiposDocumento(data.tipoDocumento);
//         } else if (Array.isArray(data.tipos_documento)) {
//           setTiposDocumento(data.tipos_documento);
//         } else if (Array.isArray(data.data)) {
//           setTiposDocumento(data.data);
//         } else {
//           // Si no encontramos los datos en ninguno de los campos esperados
//           console.warn("Formato de respuesta inesperado para tipos de documento");
//           // Usamos datos de ejemplo
//           setTiposDocumento([
//             { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
//             { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
//             { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
//             { idtipo_documento: 4, tipo_documento: "Pasaporte" }
//           ]);
//         }
//       } else {
//         // Si no hay éxito en la respuesta, usamos datos de ejemplo
//         setTiposDocumento([
//           { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
//           { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
//           { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
//           { idtipo_documento: 4, tipo_documento: "Pasaporte" }
//         ]);
//       }
//     } catch (err) {
//       console.error("Error al obtener tipos de documento:", err);
//       // Si hay error, usamos datos de ejemplo
//       setTiposDocumento([
//         { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
//         { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
//         { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
//         { idtipo_documento: 4, tipo_documento: "Pasaporte" }
//       ]);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   // Efecto para cargar datos iniciales
//   useEffect(() => {
//     if (open) {
//       setLoadingData(true);
//       Promise.all([fetchEstadosAprendiz(), fetchTiposDocumento()])
//         .catch(err => {
//           console.error("Error al cargar datos iniciales:", err);
//         })
//         .finally(() => {
//           setLoadingData(false);
//         });
//     }
//   }, [open]);

//   // Efecto para inicializar el formulario con datos adecuados
//   useEffect(() => {
//     if (open) {
//       console.log("Estado de edición:", isEditing ? "Editando" : "Creando nuevo");
//       console.log("Aprendiz recibido:", aprendiz);
      
//       if (isEditing && aprendiz) {
//         // Si estamos editando, usamos los datos del aprendiz existente
//         console.log("Inicializando formulario con datos de aprendiz existente:", aprendiz);
//         setFormData({
//           ...aprendiz,
//           ficha_idficha: parseInt(fichaId)
//         });
//       } else {
//         // Para un nuevo aprendiz, establecemos valores predeterminados
//         const defaultEstadoId = estadosAprendiz.length > 0 ? estadosAprendiz[0].idestado_aprendiz : 1;
//         const defaultTipoDocId = tiposDocumento.length > 0 ? tiposDocumento[0].idtipo_documento : 1;
        
//         console.log("Inicializando formulario para nuevo aprendiz con valores por defecto");
//         setFormData({
//           ...aprendizVacio,
//           ficha_idficha: parseInt(fichaId),
//           estado_aprendiz_idestado_aprendiz: defaultEstadoId,
//           tipo_documento_idtipo_documento: defaultTipoDocId,
//         });
//       }
//     }
//   }, [open, aprendiz, fichaId, estadosAprendiz, tiposDocumento, isEditing]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSelectChange = (e: SelectChangeEvent<number>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: Number(value)
//     });
//   };

//   const validateForm = () => {
//     // Validar campos requeridos
//     if (!formData.documento_aprendiz.trim()) {
//       showSnackbar("El documento del aprendiz es obligatorio", "error");
//       return false;
//     }
//     if (!formData.nombres_aprendiz.trim()) {
//       showSnackbar("El nombre del aprendiz es obligatorio", "error");
//       return false;
//     }
//     if (!formData.apellidos_aprendiz.trim()) {
//       showSnackbar("El apellido del aprendiz es obligatorio", "error");
//       return false;
//     }
//     if (!formData.email_aprendiz.trim()) {
//       showSnackbar("El correo electrónico es obligatorio", "error");
//       return false;
//     }
//     // Validar formato de correo
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email_aprendiz)) {
//       showSnackbar("El formato del correo electrónico no es válido", "error");
//       return false;
//     }
//     // Si es un nuevo aprendiz, validar la contraseña
//     if (!isEditing && !formData.password_aprendiz.trim()) {
//       showSnackbar("La contraseña es obligatoria", "error");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     const token = localStorage.getItem("token");
//     setLoading(true);

//     try {
//       // Mejorar la construcción de URL para edición
//       const url = isEditing && formData.idaprendiz
//         ? `http://localhost:8000/aprendiz/${formData.idaprendiz}`
//         : "http://localhost:8000/aprendiz";
      
//       const method = isEditing ? "PUT" : "POST";
      
//       // Preparar los datos a enviar
//       let dataToSend = { ...formData };
      
//       // Si estamos creando, eliminar el idaprendiz
//       if (!isEditing) {
//         dataToSend = { ...dataToSend, idaprendiz: undefined };
//       }
      
//       // Asegurar que todos los IDs sean números
//       dataToSend = {
//         ...dataToSend,
//         ficha_idficha: Number(dataToSend.ficha_idficha),
//         estado_aprendiz_idestado_aprendiz: Number(dataToSend.estado_aprendiz_idestado_aprendiz),
//         tipo_documento_idtipo_documento: Number(dataToSend.tipo_documento_idtipo_documento)
//       };
      
//       console.log("📤 Datos enviados al backend:", {
//         url,
//         method,
//         isEditing,
//         formData: dataToSend,
//       });

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(dataToSend),
//       });
      
//       console.log("Respuesta del servidor:", {
//         status: res.status,
//         statusText: res.statusText,
//         headers: Object.fromEntries([...res.headers])
//       });

//       // Mejorar el manejo de respuestas
//       const responseText = await res.text();
//       let data;
      
//       try {
//         // Intentar analizar la respuesta como JSON
//         data = JSON.parse(responseText);
//       } catch (e) {
//         console.error("Error al parsear respuesta:", e);
//         console.log("Respuesta del servidor:", responseText);
//         showSnackbar("Error: Respuesta del servidor no es JSON válido", "error");
//         setLoading(false);
//         return;
//       }
      
//       if (data.success) {
//         showSnackbar(
//           isEditing
//             ? "Aprendiz actualizado exitosamente"
//             : "Aprendiz creado exitosamente",
//           "success"
//         );
//         onAprendizCreated();
//         onClose();
//       } else {
//         // Mostrar información detallada sobre el error
//         console.error("Error del servidor:", data);
//         showSnackbar(
//           data.msg || data.error || data.message || "Error al guardar el aprendiz", 
//           "error"
//         );
//       }
//     } catch (err) {
//       console.error("Error al guardar aprendiz:", err);
//       showSnackbar("Error al conectar con el servidor", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       aria-labelledby="formulario-aprendiz-titulo"
//     >
//       <DialogTitle id="formulario-aprendiz-titulo">
//         {isEditing ? "Editar Aprendiz" : "Registrar Nuevo Aprendiz"}
//       </DialogTitle>
//       <DialogContent>
//         {loadingData ? (
//           <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
//         ) : (
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth margin="dense">
//                 <InputLabel id="tipo-documento-label">Tipo de Documento</InputLabel>
//                 <Select
//                   labelId="tipo-documento-label"
//                   id="tipo_documento_idtipo_documento"
//                   name="tipo_documento_idtipo_documento"
//                   value={formData.tipo_documento_idtipo_documento || ""}
//                   label="Tipo de Documento"
//                   onChange={handleSelectChange}
//                   disabled={tiposDocumento.length === 0}
//                 >
//                   {tiposDocumento.map((tipo) => (
//                     <MenuItem key={tipo.idtipo_documento} value={tipo.idtipo_documento}>
//                       {tipo.tipo_documento}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="documento_aprendiz"
//                 label="Número de Documento"
//                 type="text"
//                 fullWidth
//                 value={formData.documento_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="nombres_aprendiz"
//                 label="Nombres"
//                 type="text"
//                 fullWidth
//                 value={formData.nombres_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="apellidos_aprendiz"
//                 label="Apellidos"
//                 type="text"
//                 fullWidth
//                 value={formData.apellidos_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="telefono_aprendiz"
//                 label="Teléfono"
//                 type="text"
//                 fullWidth
//                 value={formData.telefono_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="email_aprendiz"
//                 label="Correo Electrónico"
//                 type="email"
//                 fullWidth
//                 value={formData.email_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             {!isEditing && (
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   margin="dense"
//                   name="password_aprendiz"
//                   label="Contraseña"
//                   type="password"
//                   fullWidth
//                   value={formData.password_aprendiz}
//                   onChange={handleInputChange}
//                   variant="outlined"
//                 />
//               </Grid>
//             )}
//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth margin="dense">
//                 <InputLabel id="estado-aprendiz-label">Estado del Aprendiz</InputLabel>
//                 <Select
//                   labelId="estado-aprendiz-label"
//                   id="estado_aprendiz_idestado_aprendiz"
//                   name="estado_aprendiz_idestado_aprendiz"
//                   value={formData.estado_aprendiz_idestado_aprendiz || ""}
//                   label="Estado del Aprendiz"
//                   onChange={handleSelectChange}
//                   disabled={estadosAprendiz.length === 0}
//                 >
//                   {estadosAprendiz.map((estado) => (
//                     <MenuItem key={estado.idestado_aprendiz} value={estado.idestado_aprendiz}>
//                       {estado.estado_aprendiz}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} color="inherit">
//           Cancelar
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           color="primary"
//           variant="contained"
//           disabled={loading}
//         >
//           {loading ? (
//             <CircularProgress size={24} color="inherit" />
//           ) : isEditing ? (
//             "Actualizar"
//           ) : (
//             "Guardar"
//           )}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default FormularioAprendiz;
// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   CircularProgress,
//   Typography,
//   IconButton
// } from "@mui/material";
// import { SelectChangeEvent } from "@mui/material/Select";
// import useSnackbar from "../../shared/useSnackbar";

// // Interfaces
// interface EstadoAprendiz {
//   idestado_aprendiz: number;
//   estado_aprendiz: string;
// }

// interface TipoDocumento {
//   idtipo_documento: number;
//   tipo_documento: string;
// }

// interface Aprendiz {
//   idaprendiz: number | null;
//   documento_aprendiz: string;
//   nombres_aprendiz: string;
//   apellidos_aprendiz: string;
//   telefono_aprendiz: string;
//   email_aprendiz: string;
//   password_aprendiz: string;
//   ficha_idficha: number;
//   estado_aprendiz_idestado_aprendiz: number;
//   tipo_documento_idtipo_documento: number;
// }

// interface FormularioAprendizProps {
//   open: boolean;
//   onClose: () => void;
//   aprendiz?: Aprendiz | null;
//   fichaId: string;
//   onAprendizCreated: () => void;
// }

// const aprendizVacio: Aprendiz = {
//   idaprendiz: null,
//   documento_aprendiz: "",
//   nombres_aprendiz: "",
//   apellidos_aprendiz: "",
//   telefono_aprendiz: "",
//   email_aprendiz: "",
//   password_aprendiz: "",
//   ficha_idficha: 0,
//   estado_aprendiz_idestado_aprendiz: 0,
//   tipo_documento_idtipo_documento: 0
// };

// const FormularioAprendiz: React.FC<FormularioAprendizProps> = ({
//   open,
//   onClose,
//   aprendiz,
//   fichaId,
//   onAprendizCreated
// }) => {
//   const [formData, setFormData] = useState<Aprendiz>(aprendizVacio);
//   const [estadosAprendiz, setEstadosAprendiz] = useState<EstadoAprendiz[]>([]);
//   const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingData, setLoadingData] = useState(true);
//   const { showSnackbar } = useSnackbar();
//   const isEditing = Boolean(aprendiz?.idaprendiz);

//   // Cargar los estados de aprendiz
//   const fetchEstadosAprendiz = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch("http://localhost:8000/estado_aprendiz", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       if (!res.ok) {
//         throw new Error(`Error HTTP: ${res.status}`);
//       }
      
//       const data = await res.json();
      
//       // Verificamos la estructura de la respuesta
//       if (data.success) {
//         // Verificamos si los datos están en estados_aprendiz o estados
//         if (Array.isArray(data.estados_aprendiz)) {
//           setEstadosAprendiz(data.estados_aprendiz);
//         } else if (Array.isArray(data.estados)) {
//           setEstadosAprendiz(data.estados);
//         } else {
//           // Si no encontramos los datos en ninguno de los campos esperados
//           showSnackbar("Formato de respuesta inesperado para estados de aprendiz", "error");
//           // Usamos datos de ejemplo
//           setEstadosAprendiz([
//             { idestado_aprendiz: 1, estado_aprendiz: "Activo" },
//             { idestado_aprendiz: 2, estado_aprendiz: "Inactivo" }
//           ]);
//         }
//       } else {
//         showSnackbar("No se pudieron cargar los estados de aprendiz", "error");
//         // Usamos datos de ejemplo
//         setEstadosAprendiz([
//           { idestado_aprendiz: 1, estado_aprendiz: "Activo" },
//           { idestado_aprendiz: 2, estado_aprendiz: "Inactivo" }
//         ]);
//       }
//     } catch (err) {
//       console.error("Error al obtener estados de aprendiz:", err);
//       showSnackbar("Error al conectar con el servidor", "error");
//       // Usamos datos de ejemplo
//       setEstadosAprendiz([
//         { idestado_aprendiz: 1, estado_aprendiz: "Activo" },
//         { idestado_aprendiz: 2, estado_aprendiz: "Inactivo" }
//       ]);
//     }
//   };

//   // Cargar los tipos de documento
//   const fetchTiposDocumento = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch("http://localhost:8000/tipoDocumento", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
      
//       if (!res.ok) {
//         throw new Error(`Error HTTP: ${res.status}`);
//       }
      
//       const data = await res.json();
      
//       // Verificamos la estructura de la respuesta
//       if (data.success) {
//         // Verificamos si los datos están en tipoDocumento o en otro campo
//         if (Array.isArray(data.tipoDocumento)) {
//           setTiposDocumento(data.tipoDocumento);
//         } else if (Array.isArray(data.tipos_documento)) {
//           setTiposDocumento(data.tipos_documento);
//         } else if (Array.isArray(data.data)) {
//           setTiposDocumento(data.data);
//         } else {
//           // Si no encontramos los datos en ninguno de los campos esperados
//           console.warn("Formato de respuesta inesperado para tipos de documento");
//           // Usamos datos de ejemplo
//           setTiposDocumento([
//             { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
//             { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
//             { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
//             { idtipo_documento: 4, tipo_documento: "Pasaporte" }
//           ]);
//         }
//       } else {
//         // Si no hay éxito en la respuesta, usamos datos de ejemplo
//         setTiposDocumento([
//           { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
//           { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
//           { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
//           { idtipo_documento: 4, tipo_documento: "Pasaporte" }
//         ]);
//       }
//     } catch (err) {
//       console.error("Error al obtener tipos de documento:", err);
//       // Si hay error, usamos datos de ejemplo
//       setTiposDocumento([
//         { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
//         { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
//         { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
//         { idtipo_documento: 4, tipo_documento: "Pasaporte" }
//       ]);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   useEffect(() => {
//     if (open) {
//       setLoadingData(true);
//       Promise.all([fetchEstadosAprendiz(), fetchTiposDocumento()])
//         .catch(err => {
//           console.error("Error al cargar datos iniciales:", err);
//           setLoadingData(false);
//         });
//     }
//   }, [open]);

//   useEffect(() => {
//     if (open) {
//       if (aprendiz) {
//         setFormData({
//           ...aprendiz,
//           ficha_idficha: parseInt(fichaId)
//         });
//       } else {
//         // Para un nuevo aprendiz, establecemos valores predeterminados
//         const defaultEstadoId = estadosAprendiz.length > 0 ? estadosAprendiz[0].idestado_aprendiz : 1;
//         const defaultTipoDocId = tiposDocumento.length > 0 ? tiposDocumento[0].idtipo_documento : 1;
        
//         setFormData({
//           ...aprendizVacio,
//           ficha_idficha: parseInt(fichaId),
//           estado_aprendiz_idestado_aprendiz: defaultEstadoId,
//           tipo_documento_idtipo_documento: defaultTipoDocId,
//         });
//       }
//     }
//   }, [open, aprendiz, fichaId, estadosAprendiz, tiposDocumento]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSelectChange = (e: SelectChangeEvent<number>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: Number(value)
//     });
//   };

//   const validateForm = () => {
//     // Validar campos requeridos
//     if (!formData.documento_aprendiz.trim()) {
//       showSnackbar("El documento del aprendiz es obligatorio", "error");
//       return false;
//     }
//     if (!formData.nombres_aprendiz.trim()) {
//       showSnackbar("El nombre del aprendiz es obligatorio", "error");
//       return false;
//     }
//     if (!formData.apellidos_aprendiz.trim()) {
//       showSnackbar("El apellido del aprendiz es obligatorio", "error");
//       return false;
//     }
//     if (!formData.email_aprendiz.trim()) {
//       showSnackbar("El correo electrónico es obligatorio", "error");
//       return false;
//     }
//     // Validar formato de correo
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email_aprendiz)) {
//       showSnackbar("El formato del correo electrónico no es válido", "error");
//       return false;
//     }
//     // Si es un nuevo aprendiz, validar la contraseña
//     if (!isEditing && !formData.password_aprendiz.trim()) {
//       showSnackbar("La contraseña es obligatoria", "error");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     const token = localStorage.getItem("token");
//     setLoading(true);

//     try {
//       const url = isEditing
//         ? `http://localhost:8000/aprendiz/${formData.idaprendiz}`
//         : "http://localhost:8000/aprendiz";
      
//       const method = isEditing ? "PUT" : "POST";
      
//       console.log("📤 Datos enviados al backend:", {
//         url,
//         method,
//         formData,
//       });

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();
      
//       if (data.success) {
//         showSnackbar(
//           isEditing
//             ? "Aprendiz actualizado exitosamente"
//             : "Aprendiz creado exitosamente",
//           "success"
//         );
//         onAprendizCreated();
//         onClose();
//       } else {
//         showSnackbar(data.msg || "Error al guardar el aprendiz", "error");
//       }
//     } catch (err) {
//       console.error("Error al guardar aprendiz:", err);
//       showSnackbar("Error al conectar con el servidor", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       aria-labelledby="formulario-aprendiz-titulo"
//     >
//       <DialogTitle id="formulario-aprendiz-titulo">
//         {isEditing ? "Editar Aprendiz" : "Registrar Nuevo Aprendiz"}
//       </DialogTitle>
//       <DialogContent>
//         {loadingData ? (
//           <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
//         ) : (
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth margin="dense">
//                 <InputLabel id="tipo-documento-label">Tipo de Documento</InputLabel>
//                 <Select
//                   labelId="tipo-documento-label"
//                   id="tipo_documento_idtipo_documento"
//                   name="tipo_documento_idtipo_documento"
//                   value={formData.tipo_documento_idtipo_documento || ""}
//                   label="Tipo de Documento"
//                   onChange={handleSelectChange}
//                   disabled={tiposDocumento.length === 0}
//                 >
//                   {tiposDocumento.map((tipo) => (
//                     <MenuItem key={tipo.idtipo_documento} value={tipo.idtipo_documento}>
//                       {tipo.tipo_documento}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="documento_aprendiz"
//                 label="Número de Documento"
//                 type="text"
//                 fullWidth
//                 value={formData.documento_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="nombres_aprendiz"
//                 label="Nombres"
//                 type="text"
//                 fullWidth
//                 value={formData.nombres_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="apellidos_aprendiz"
//                 label="Apellidos"
//                 type="text"
//                 fullWidth
//                 value={formData.apellidos_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="telefono_aprendiz"
//                 label="Teléfono"
//                 type="text"
//                 fullWidth
//                 value={formData.telefono_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="email_aprendiz"
//                 label="Correo Electrónico"
//                 type="email"
//                 fullWidth
//                 value={formData.email_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             {!isEditing && (
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   margin="dense"
//                   name="password_aprendiz"
//                   label="Contraseña"
//                   type="password"
//                   fullWidth
//                   value={formData.password_aprendiz}
//                   onChange={handleInputChange}
//                   variant="outlined"
//                 />
//               </Grid>
//             )}
//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth margin="dense">
//                 <InputLabel id="estado-aprendiz-label">Estado del Aprendiz</InputLabel>
//                 <Select
//                   labelId="estado-aprendiz-label"
//                   id="estado_aprendiz_idestado_aprendiz"
//                   name="estado_aprendiz_idestado_aprendiz"
//                   value={formData.estado_aprendiz_idestado_aprendiz || ""}
//                   label="Estado del Aprendiz"
//                   onChange={handleSelectChange}
//                   disabled={estadosAprendiz.length === 0}
//                 >
//                   {estadosAprendiz.map((estado) => (
//                     <MenuItem key={estado.idestado_aprendiz} value={estado.idestado_aprendiz}>
//                       {estado.estado_aprendiz}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} color="inherit">
//           Cancelar
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           color="primary"
//           variant="contained"
//           disabled={loading}
//         >
//           {loading ? (
//             <CircularProgress size={24} color="inherit" />
//           ) : isEditing ? (
//             "Actualizar"
//           ) : (
//             "Guardar"
//           )}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default FormularioAprendiz;
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Grid,
//   CircularProgress,
//   Typography,
//   IconButton
// } from "@mui/material";
// import { SelectChangeEvent } from "@mui/material/Select";
// import useSnackbar from "../../shared/useSnackbar";

// // Interfaces
// interface EstadoAprendiz {
//   idestado_aprendiz: number;
//   estado_aprendiz: string;
// }

// interface TipoDocumento {
//   idtipo_documento: number;
//   tipo_documento: string;
// }

// interface Aprendiz {
//   idaprendiz: number | null;
//   documento_aprendiz: string;
//   nombres_aprendiz: string;
//   apellidos_aprendiz: string;
//   telefono_aprendiz: string;
//   email_aprendiz: string;
//   password_aprendiz: string;
//   ficha_idficha: number;
//   estado_aprendiz_idestado_aprendiz: number;
//   tipo_documento_idtipo_documento: number;
// }

// interface FormularioAprendizProps {
//   open: boolean;
//   onClose: () => void;
//   aprendiz?: Aprendiz | null;
//   fichaId: string;
//   onAprendizCreated: () => void;
// }

// const aprendizVacio: Aprendiz = {
//   idaprendiz: null,
//   documento_aprendiz: "",
//   nombres_aprendiz: "",
//   apellidos_aprendiz: "",
//   telefono_aprendiz: "",
//   email_aprendiz: "",
//   password_aprendiz: "",
//   ficha_idficha: 0,
//   estado_aprendiz_idestado_aprendiz: 2,
//   tipo_documento_idtipo_documento: 0
// };

// const FormularioAprendiz: React.FC<FormularioAprendizProps> = ({
//   open,
//   onClose,
//   aprendiz,
//   fichaId,
//   onAprendizCreated
// }) => {
//   const [formData, setFormData] = useState<Aprendiz>(aprendizVacio);
//   const [estadosAprendiz, setEstadosAprendiz] = useState<EstadoAprendiz[]>([]);
//   const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [loadingData, setLoadingData] = useState(true);
//   const { showSnackbar } = useSnackbar();
//   const isEditing = Boolean(aprendiz?.idaprendiz);

//   // Cargar los estados de aprendiz
//   const fetchEstadosAprendiz = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       const res = await fetch("http://localhost:8000/estado_aprendiz", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       if (data.success && Array.isArray(data.data.estados_aprendiz)) {
//         setEstadosAprendiz(data.estados);
//       } else {
//         showSnackbar("No se pudieron cargar los estados de aprendiz", "error");
//       }
//     } catch (err) {
//       console.error("Error al obtener estados de aprendiz:", err);
//       showSnackbar("Error al conectar con el servidor", "error");
//     }
//   };

//   // Cargar los tipos de documento (simulado, deberás implementar el endpoint real)
//   const fetchTiposDocumento = async () => {
//     const token = localStorage.getItem("token");
//     try {
//       // Nota: esta ruta debe existir en tu backend
//       const res = await fetch("http://localhost:8000/tipos_documento", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       const data = await res.json();
//       if (data.success && Array.isArray(data.tipoDocumento)) {
//         setTiposDocumento(data.tipoDocumento);
//       }       else {
//         // Si no hay endpoint, usamos datos de ejemplo
//         setTiposDocumento([
//           { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
//           { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
//           { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
//           { idtipo_documento: 4, tipo_documento: "Pasaporte" }
//         ]);
//       }
//     } catch (err) {
//       console.error("Error al obtener tipos de documento:", err);
//       // Si hay error, usamos datos de ejemplo
//       setTiposDocumento([
//         { idtipo_documento: 1, tipo_documento: "Cédula de Ciudadanía" },
//         { idtipo_documento: 2, tipo_documento: "Tarjeta de Identidad" },
//         { idtipo_documento: 3, tipo_documento: "Cédula de Extranjería" },
//         { idtipo_documento: 4, tipo_documento: "Pasaporte" }
//       ]);
//     } finally {
//       setLoadingData(false);
//     }
//   };

//   useEffect(() => {
//     Promise.all([fetchEstadosAprendiz(), fetchTiposDocumento()]);
//   }, []);
//   useEffect(() => {
//     if (open) {
//       if (aprendiz) {
//         setFormData({
//           ...aprendiz,
//           ficha_idficha: parseInt(fichaId)
//         });
//       } else {
//         setFormData({
//           ...aprendizVacio,
//           ficha_idficha: parseInt(fichaId),
//           estado_aprendiz_idestado_aprendiz: estadosAprendiz[0]?.idestado_aprendiz || 0,
//           tipo_documento_idtipo_documento: tiposDocumento[0]?.idtipo_documento || 0,
//         });
//       }
//     }
//   }, [open, aprendiz, fichaId, estadosAprendiz, tiposDocumento]);
  
//   /*
//   useEffect(() => {
//     if (open) {
//       if (aprendiz) {
//         setFormData({
//           ...aprendiz,
//           // Aseguramos que la ficha_idficha sea la correcta
//           ficha_idficha: parseInt(fichaId)
//         });
//       } else {
//         setFormData({
//           ...aprendizVacio,
//           ficha_idficha: parseInt(fichaId)
//         });
//       }
//     }
//   }, [open, aprendiz, fichaId]);
// */
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const handleSelectChange = (e: SelectChangeEvent<number>) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value
//     });
//   };

//   const validateForm = () => {
//     // Validar campos requeridos
//     if (!formData.documento_aprendiz.trim()) {
//       showSnackbar("El documento del aprendiz es obligatorio", "error");
//       return false;
//     }
//     if (!formData.nombres_aprendiz.trim()) {
//       showSnackbar("El nombre del aprendiz es obligatorio", "error");
//       return false;
//     }
//     if (!formData.apellidos_aprendiz.trim()) {
//       showSnackbar("El apellido del aprendiz es obligatorio", "error");
//       return false;
//     }
//     if (!formData.email_aprendiz.trim()) {
//       showSnackbar("El correo electrónico es obligatorio", "error");
//       return false;
//     }
//     // Validar formato de correo
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(formData.email_aprendiz)) {
//       showSnackbar("El formato del correo electrónico no es válido", "error");
//       return false;
//     }
//     // Si es un nuevo aprendiz, validar la contraseña
//     if (!isEditing && !formData.password_aprendiz.trim()) {
//       showSnackbar("La contraseña es obligatoria", "error");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {

//     if (!validateForm()) return;

//     const token = localStorage.getItem("token");
//     setLoading(true);

//     try {
//       const url = isEditing
//         ? `http://localhost:8000/aprendiz/${formData.idaprendiz}`
//         : "http://localhost:8000/aprendiz";
      
//       const method = isEditing ? "PUT" : "POST";
      
//       console.log("📤 Datos enviados al backend:", {
//         url,
//         method,
//         formData,
//       });

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();
      
//       if (data.success) {
//         showSnackbar(
//           isEditing
//             ? "Aprendiz actualizado exitosamente"
//             : "Aprendiz creado exitosamente",
//           "success"
//         );
//         onAprendizCreated();
//         onClose();
//       } else {
//         showSnackbar(data.msg || "Error al guardar el aprendiz", "error");
//       }
//     } catch (err) {
//       console.error("Error al guardar aprendiz:", err);
//       showSnackbar("Error al conectar con el servidor", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       aria-labelledby="formulario-aprendiz-titulo"
//     >
//       <DialogTitle id="formulario-aprendiz-titulo">
//         {isEditing ? "Editar Aprendiz" : "Registrar Nuevo Aprendiz"}
//       </DialogTitle>
//       <DialogContent>
//         {loadingData ? (
//           <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
//         ) : (
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth margin="dense">
//                 <InputLabel id="tipo-documento-label">Tipo de Documento</InputLabel>
//                 <Select
//   labelId="tipo-documento-label"
//   id="tipo_documento_idtipo_documento"
//   name="tipo_documento_idtipo_documento"
//   value={formData.tipo_documento_idtipo_documento || ""}
//   label="Tipo de Documento"
//   onChange={handleSelectChange}
//   disabled={tiposDocumento.length === 0}
// >
//   {tiposDocumento.map((tipo) => (
//     <MenuItem key={tipo.idtipo_documento} value={tipo.idtipo_documento}>
//       {tipo.tipo_documento}
//     </MenuItem>
//   ))}
// </Select>

//                 {/* /*<Select
//                   labelId="tipo-documento-label"
//                   id="tipo_documento_idtipo_documento"
//                   name="tipo_documento_idtipo_documento"
//                   value={formData.tipo_documento_idtipo_documento}
//                   label="Tipo de Documento"
//                   onChange={handleSelectChange}
//                 >
//                   {tiposDocumento.map((tipo) => (
//                     <MenuItem key={tipo.idtipo_documento} value={tipo.idtipo_documento}>
//                       {tipo.tipo_documento}
//                     </MenuItem>
//                   ))}
//                 </Select>*/ }
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="documento_aprendiz"
//                 label="Número de Documento"
//                 type="text"
//                 fullWidth
//                 value={formData.documento_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="nombres_aprendiz"
//                 label="Nombres"
//                 type="text"
//                 fullWidth
//                 value={formData.nombres_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="apellidos_aprendiz"
//                 label="Apellidos"
//                 type="text"
//                 fullWidth
//                 value={formData.apellidos_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="telefono_aprendiz"
//                 label="Teléfono"
//                 type="text"
//                 fullWidth
//                 value={formData.telefono_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             <Grid item xs={12} md={6}>
//               <TextField
//                 margin="dense"
//                 name="email_aprendiz"
//                 label="Correo Electrónico"
//                 type="email"
//                 fullWidth
//                 value={formData.email_aprendiz}
//                 onChange={handleInputChange}
//                 variant="outlined"
//               />
//             </Grid>
//             {!isEditing && (
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   margin="dense"
//                   name="password_aprendiz"
//                   label="Contraseña"
//                   type="password"
//                   fullWidth
//                   value={formData.password_aprendiz}
//                   onChange={handleInputChange}
//                   variant="outlined"
//                 />
//               </Grid>
//             )}
//             <Grid item xs={12} md={6}>
//               <FormControl fullWidth margin="dense">
//                 <InputLabel id="estado-aprendiz-label">Estado del Aprendiz</InputLabel>
//                 {/* <Select
//   labelId="estado-aprendiz-label"
//   id="estado_aprendiz_idestado_aprendiz"
//   name="estado_aprendiz_idestado_aprendiz"
//   value={formData.estado_aprendiz_idestado_aprendiz || ""}
//   label="Estado del Aprendiz"
//   onChange={handleSelectChange}
//   disabled={estadosAprendiz.length === 0}
// >
//   {estadosAprendiz.map((estado) => (
//     <MenuItem key={estado.idestado_aprendiz} value={estado.idestado_aprendiz}>
//       {estado.estado_aprendiz}
//     </MenuItem>
//   ))}
// </Select> */}
//                 <Select
//                   labelId="estado-aprendiz-label"
//                   id="estado_aprendiz_idestado_aprendiz"
//                   name="estado_aprendiz_idestado_aprendiz"
//                   value={formData.estado_aprendiz_idestado_aprendiz}
//                   label="Estado del Aprendiz"
//                   onChange={handleSelectChange}
//                 >
//                   {estadosAprendiz.map((estado) => (
//                     <MenuItem key={estado.idestado_aprendiz} value={estado.idestado_aprendiz}>
//                       {estado.estado_aprendiz}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={onClose} color="inherit">
//           Cancelar
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           color="primary"
//           variant="contained"
//           disabled={loading}
//         >
//           {loading ? (
//             <CircularProgress size={24} color="inherit" />
//           ) : isEditing ? (
//             "Actualizar"
//           ) : (
//             "Guardar"
//           )}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default FormularioAprendiz;