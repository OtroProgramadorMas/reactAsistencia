import React, { useState, useEffect } from "react";
import { 
  Button, 
  Stack, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Box,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DinamicTable from "../../shared/dataTable";

// API URL base
const API_URL = 'http://localhost:8000';

interface TipoDocumento {
  idtipo_documento: number;
  tipo_documento: string;
}

interface AdminData {
  id?: number;
  nombre: string;
  apellido: string;
  idtipo_documento: number | string;
  tipoDocumento?: string;
  documento: string;
  telefono: string;
  email: string;
  password?: string;
  rol: string;
  imagen?: string | null;
}

// Tipo de alerta
interface AlertState {
  open: boolean;
  message: string;
  severity: "success" | "info" | "warning" | "error";
}

const AdminPanel: React.FC = () => {
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<AlertState>({
    open: false,
    message: "",
    severity: "success"
  });

  const [newAdmin, setNewAdmin] = useState<AdminData>({
    nombre: "",
    apellido: "",
    idtipo_documento: "",
    documento: "",
    telefono: "",
    email: "",
    password: "",
    rol: "Administrador",
    imagen: null
  });

  const [editingAdmin, setEditingAdmin] = useState<AdminData | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminData | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Obtener token de autenticación
  const getToken = (): string | null => localStorage.getItem('token');

  // Opciones para fetch con headers de autenticación
  const getOptions = (method = 'GET', body: Record<string, unknown> | null = null): RequestInit => {
    const baseOptions: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      }
    };
    
    const options: RequestInit = body 
      ? { ...baseOptions, body: JSON.stringify(body) }
      : baseOptions;
    
    return options;
  };

  // Función para mostrar notificaciones
  const showAlert = (message: string, severity: "success" | "info" | "warning" | "error" = "success"): void => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  const handleCloseAlert = (): void => {
    setAlert({
      ...alert,
      open: false
    });
  };

  // Cargar tipos de documento desde la API
  const fetchTiposDocumento = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/tipoDocumento`, getOptions());
      
      if (!response.ok) {
        throw new Error('No se pudo obtener los tipos de documento');
      }
      
      const data = await response.json();
      if (data.success && data.tipoDocumento) {
        setTiposDocumento(data.tipoDocumento);
      } else {
        // Fallback a valores por defecto
        setTiposDocumento([
          { idtipo_documento: 1, tipo_documento: "CC" },
          { idtipo_documento: 2, tipo_documento: "CE" },
          { idtipo_documento: 3, tipo_documento: "TI" },
          { idtipo_documento: 4, tipo_documento: "Pasaporte" }
        ]);
      }
    } catch (error) {
      console.error("Error al cargar tipos de documento:", error);
      // Fallback a valores por defecto
      setTiposDocumento([
        { idtipo_documento: 1, tipo_documento: "CC" },
        { idtipo_documento: 2, tipo_documento: "CE" },
        { idtipo_documento: 3, tipo_documento: "TI" },
        { idtipo_documento: 4, tipo_documento: "Pasaporte" }
      ]);
      showAlert("Error al cargar tipos de documento", "error");
    }
  };

  // Cargar administradores desde la API
  const fetchAdministradores = async (): Promise<void> => {
    setTableLoading(true);
    try {
      const response = await fetch(`${API_URL}/administradores`, getOptions());
      
      if (!response.ok) {
        throw new Error('No se pudo obtener los administradores');
      }
      
      const data = await response.json();
      if (data.success && data.administradores) {
        // Mapear los datos del backend al formato esperado por la tabla
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adminsFormateados = data.administradores.map((admin: any) => ({
          id: admin.id_administrador,
          nombre: admin.nombre,
          apellido: admin.apellido,
          tipoDocumento: admin.tipo_documento,
          idtipo_documento: admin.idtipo_documento,
          documento: admin.documento,
          telefono: admin.telefono,
          email: admin.email,
          rol: admin.rol,
          imagen: admin.imagen
        }));
        setAdmins(adminsFormateados);
      } else {
        setAdmins([]);
        showAlert("No se encontraron administradores", "info");
      }
    } catch (error) {
      console.error("Error al cargar administradores:", error);
      showAlert("Error al cargar administradores", "error");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposDocumento();
    fetchAdministradores();
  }, []);  

  // Manejo de modales
  const handleOpenModal = (): void => {
    setOpenModal(true);
    setNewAdmin({
      nombre: "",
      apellido: "",
      idtipo_documento: "",
      documento: "",
      telefono: "",
      email: "",
      password: "",
      rol: "Administrador",
      imagen: null
    });
    setSelectedImage(null);
    setImagePreview("");
  };

  const handleCloseModal = (): void => {
    setOpenModal(false);
  };

  const handleOpenEditModal = (admin: AdminData): void => {
    setEditingAdmin({...admin});
    setImagePreview(admin.imagen || "");
    setOpenEditModal(true);
  };

  const handleCloseEditModal = (): void => {
    setOpenEditModal(false);
    setEditingAdmin(null);
    setImagePreview("");
  };

  const handleOpenDeleteModal = (admin: AdminData): void => {
    setDeletingAdmin(admin);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = (): void => {
    setOpenDeleteModal(false);
    setDeletingAdmin(null);
  };

  // Manejo de cambios en formularios
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>): void => {
    const name = e.target.name as keyof AdminData;
    const value = e.target.value;
    
    setNewAdmin({
      ...newAdmin,
      [name]: value
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>): void => {
    if (!editingAdmin) return;
    
    const name = e.target.name as keyof AdminData;
    const value = e.target.value;
    
    setEditingAdmin({
      ...editingAdmin,
      [name]: value
    });
  };

  // Manejo de subida de imágenes
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setNewAdmin({
          ...newAdmin,
          imagen: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!editingAdmin) return;
    
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setEditingAdmin({
          ...editingAdmin,
          imagen: result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // CRUD Operations
  const handleAddAdmin = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Asegúrate de que idtipo_documento sea un número
      const idTipoDocumentoNumerico = typeof newAdmin.idtipo_documento === 'string' 
        ? parseInt(newAdmin.idtipo_documento) 
        : newAdmin.idtipo_documento;
        
      // Preparar datos para envío
      const adminData = {
        nombre: newAdmin.nombre,
        apellido: newAdmin.apellido,
        idtipo_documento: idTipoDocumentoNumerico,
        documento: newAdmin.documento,
        telefono: newAdmin.telefono,
        email: newAdmin.email,
        password: newAdmin.password || "password123", // Password por defecto si no se proporciona
        rol: "Administrador",
        imagen: newAdmin.imagen
      };
    
      const response = await fetch(
        `${API_URL}/administradores`, 
        getOptions('POST', adminData as Record<string, unknown>)
      );
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showAlert("Administrador agregado con éxito");
        fetchAdministradores(); // Recargar la lista
        handleCloseModal();
      } else {
        throw new Error(result.message || "Error al crear administrador");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al agregar administrador:", error);
      showAlert(error.message || "Error al agregar administrador", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingAdmin) return;
    
    try {
      setLoading(true);
      
      // Preparar datos para envío
      const adminData: Record<string, unknown> = {
        nombre: editingAdmin.nombre,
        apellido: editingAdmin.apellido,
        idtipo_documento: typeof editingAdmin.idtipo_documento === 'string' 
          ? parseInt(editingAdmin.idtipo_documento) 
          : editingAdmin.idtipo_documento,
        documento: editingAdmin.documento,
        telefono: editingAdmin.telefono,
        email: editingAdmin.email,
        rol: editingAdmin.rol
      };
      
      // Solo incluir imagen si ha cambiado
      if (imagePreview && imagePreview !== editingAdmin.imagen) {
        adminData.imagen = imagePreview;
      }
      
      const response = await fetch(
        `${API_URL}/administradores/${editingAdmin.id}`,
        getOptions('PUT', adminData)
      );
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showAlert("Administrador actualizado con éxito");
        fetchAdministradores(); // Recargar la lista
        handleCloseEditModal();
      } else {
        throw new Error(result.message || "Error al actualizar administrador");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al actualizar administrador:", error);
      showAlert(error.message || "Error al actualizar administrador", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingAdmin) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_URL}/administradores/${deletingAdmin.id}`,
        getOptions('DELETE')
      );
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showAlert("Administrador eliminado con éxito");
        fetchAdministradores(); // Recargar la lista
        handleCloseDeleteModal();
      } else {
        throw new Error(result.message || "Error al eliminar administrador");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error al eliminar administrador:", error);
      showAlert(error.message || "Error al eliminar administrador", "error");
    } finally {
      setLoading(false);
    }
  };

  // Validación de formularios
  const isFormValid = (admin: AdminData): boolean => {
    return !!admin.nombre && 
           !!admin.apellido && 
           !!admin.idtipo_documento && 
           !!admin.documento && 
           !!admin.telefono && 
           !!admin.email;
  };

  const handleEdit = (row: AdminData): void => {
    handleOpenEditModal(row);
  };

  const handleDelete = (row: AdminData): void => {
    handleOpenDeleteModal(row);
  };

  // Configuración de columnas para la tabla
  const columns = [
    { 
      field: "imagen", 
      headerName: "Imagen", 
      width: 80,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderCell: (params: any) => (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#e0e0e0'
          }}
        >
          {params.value ? (
            <img
              src={params.value}
              alt={params.row.nombre}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {params.row.nombre.charAt(0).toUpperCase()}
            </Typography>
          )}
        </Box>
      ),
    },
    { field: "id", headerName: "ID", width: 70 },
    { field: "nombre", headerName: "Nombre", width: 120 },
    { field: "apellido", headerName: "Apellido", width: 120 },
    { field: "tipoDocumento", headerName: "Tipo Doc.", width: 100 },
    { field: "documento", headerName: "Documento", width: 120 },
    { field: "telefono", headerName: "Teléfono", width: 120 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "rol", headerName: "Rol", width: 120 },
  ];

  const actions = [
    {
      label: "Editar",
      icon: <EditIcon />,
      color: "info",
      onClick: handleEdit,
    },
    {
      label: "Eliminar",
      icon: <DeleteIcon />,
      color: "error",
      onClick: handleDelete,
    },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h5" component="h2">
        Panel de Administradores
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleOpenModal}
        sx={{ alignSelf: "flex-end" }}
        disabled={tableLoading}
      >
        Agregar Administrador
      </Button>

      <DinamicTable 
        rows={admins} 
        columns={columns} 
        actions={actions} 
        loading={tableLoading}
      />

      {/* Modal para agregar administrador */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Nuevo Administrador</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Campo para subir imagen */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 2 
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#e0e0e0',
                  mb: 2
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Foto
                  </Typography>
                )}
              </Box>

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
              >
                Subir Imagen
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>
            </Box>
            
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={newAdmin.nombre}
              onChange={handleInputChange}
              required
            />
            
            <TextField
              fullWidth
              label="Apellido"
              name="apellido"
              value={newAdmin.apellido}
              onChange={handleInputChange}
              required
            />

            <FormControl fullWidth required>
              <InputLabel id="tipo-documento-label">Tipo de Documento</InputLabel>
              <Select
                labelId="tipo-documento-label"
                id="tipo-documento-select"
                name="idtipo_documento"
                value={newAdmin.idtipo_documento}
                label="Tipo de Documento"
                onChange={handleInputChange}
              >
                {tiposDocumento.map((tipo) => (
                  <MenuItem key={tipo.idtipo_documento} value={tipo.idtipo_documento}>
                    {tipo.tipo_documento}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Número de Documento"
              name="documento"
              value={newAdmin.documento}
              onChange={handleInputChange}
              required
            />
            
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={newAdmin.telefono}
              onChange={handleInputChange}
              required
            />
            
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={newAdmin.email}
              onChange={handleInputChange}
              required
            />
            
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={newAdmin.password}
              onChange={handleInputChange}
              placeholder="Dejar en blanco para contraseña por defecto"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button 
            onClick={handleAddAdmin}
            variant="contained"
            disabled={!isFormValid(newAdmin) || loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Guardando...
              </>
            ) : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para editar administrador */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Administrador</DialogTitle>
        <DialogContent>
          {editingAdmin && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              {/* Campo para subir imagen */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  mb: 2 
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#e0e0e0',
                    mb: 2
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      {editingAdmin.nombre.charAt(0).toUpperCase()}
                    </Typography>
                  )}
                </Box>

                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                >
                  Cambiar Imagen
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleEditImageUpload}
                  />
                </Button>
              </Box>
              
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={editingAdmin.nombre}
                onChange={handleEditInputChange}
                required
              />
              
              <TextField
                fullWidth
                label="Apellido"
                name="apellido"
                value={editingAdmin.apellido}
                onChange={handleEditInputChange}
                required
              />

              <FormControl fullWidth required>
                <InputLabel id="edit-tipo-documento-label">Tipo de Documento</InputLabel>
                <Select
                  labelId="edit-tipo-documento-label"
                  id="edit-tipo-documento-select"
                  name="idtipo_documento"
                  value={editingAdmin.idtipo_documento}
                  label="Tipo de Documento"
                  onChange={handleEditInputChange}
                >
                  {tiposDocumento.map((tipo) => (
                    <MenuItem key={tipo.idtipo_documento} value={tipo.idtipo_documento}>
                      {tipo.tipo_documento}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Número de Documento"
                name="documento"
                value={editingAdmin.documento}
                onChange={handleEditInputChange}
                required
              />
              
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={editingAdmin.telefono}
                onChange={handleEditInputChange}
                required
              />
              
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={editingAdmin.email}
                onChange={handleEditInputChange}
                required
              />
              
              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type="password"
                value={editingAdmin.password || ""}
                onChange={handleEditInputChange}
                placeholder="Dejar en blanco para mantener la actual"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancelar</Button>
          <Button 
            onClick={handleSaveEdit}
            variant="contained"
            disabled={!editingAdmin || !isFormValid(editingAdmin) || loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Guardando...
              </>
            ) : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={openDeleteModal} onClose={handleCloseDeleteModal}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            ¿Está seguro que desea eliminar al administrador {deletingAdmin?.nombre} {deletingAdmin?.apellido}?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal}>Cancelar</Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Eliminando...
              </>
            ) : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificaciones */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default AdminPanel;