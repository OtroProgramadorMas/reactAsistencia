import React, { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Avatar,
    Chip,
    Tooltip,
    Alert,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon
} from "@mui/icons-material";
import ModalFuncionario from "../Funcionarios/ModalFuncionario/MOdalFunci";

// API URL base
const API_URL = "http://localhost:8000";

// Interfaces
interface Funcionario {
    idFuncionario: number;
    documento: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    url_imgFuncionario: string | null;
    tipo_documento_idtipo_documento: number;
    tipo_documento?: string;
    abreviatura_tipo_documento?: string;
    roles: {
        idtipo_funcionario: number;
        tipo_funcionario: string;
        password?: string;
    }[];
    fichas?: {
        idficha: number;
        codigo_ficha: string;
        nombre_programa?: string;
    }[];
}

// Datos para enviar al API
interface FuncionarioApiData {
    funcionario: {
        idFuncionario?: number;
        documento: string;
        nombres: string;
        apellidos: string;
        email: string;
        telefono: string;
        password?: string;
        url_imgFuncionario?: string | null;
        tipo_documento_idtipo_documento: number;
    };
    roles: { idRol: number; password: string }[];
    fichas?: number[];
}

const GestionFuncionarios: React.FC = () => {
    // Estados
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [funcionarioEditando, setFuncionarioEditando] = useState<Funcionario | null>(null);
    const [dialogoEliminarAbierto, setDialogoEliminarAbierto] = useState<boolean>(false);
    const [funcionarioAEliminar, setFuncionarioAEliminar] = useState<number | null>(null);
    const [notificacion, setNotificacion] = useState<{
        abierta: boolean;
        mensaje: string;
        tipo: "success" | "error" | "info" | "warning";
    }>({
        abierta: false,
        mensaje: "",
        tipo: "success"
    });
    const [busqueda, setBusqueda] = useState<string>("");
    
    // Obtener token de autenticación
    const getToken = (): string | null => localStorage.getItem("token");

    // Cargar funcionarios al montar el componente
    useEffect(() => {
        cargarFuncionarios();
    }, []);

    // Funciones para interactuar con la API
    const cargarFuncionarios = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = getToken();
            if (!token) throw new Error("No se encontró token de autenticación");

            const response = await fetch(`${API_URL}/funcionarios`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener funcionarios");
            
            const data = await response.json();

            if (data.success && data.funcionarios) {
                setFuncionarios(data.funcionarios);
            } else {
                throw new Error(data.msg || "No se pudieron cargar los funcionarios");
            }
        } catch (err) {
            console.error("Error al cargar funcionarios:", err);
            setError(err instanceof Error ? err.message : "Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    // Subir imagen
    const subirImagen = async (file: File): Promise<string> => {
        try {
            const token = getToken();
            if (!token) throw new Error("No se encontró token");

            const formData = new FormData();
            formData.append("imagen", file);

            const response = await fetch(`${API_URL}/upload`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error("Error al subir imagen");

            const data = await response.json();

            if (data.success && data.imageUrl) {
                return data.imageUrl;
            } else {
                throw new Error(data.msg || "Error al subir imagen");
            }
        } catch (err) {
            console.error("Error al subir imagen:", err);
            throw err;
        }
    };

    // Guardar funcionario (crear o actualizar)
    const guardarFuncionario = async (formData: FuncionarioApiData, file: File | null) => {
        try {
            const token = getToken();
            if (!token) throw new Error("No se encontró token");

            // Si hay un archivo, subirlo primero
            if (file) {
                const imageUrl = await subirImagen(file);
                formData.funcionario.url_imgFuncionario = imageUrl;
            }

            // Determinar si es creación o actualización
            const isEdicion = formData.funcionario.idFuncionario !== undefined;
            const url = isEdicion 
                ? `${API_URL}/funcionarios/${formData.funcionario.idFuncionario}` 
                : `${API_URL}/funcionarios`;
            
            const method = isEdicion ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Error al guardar funcionario");
            }

            const data = await response.json();

            // Recargar funcionarios
            await cargarFuncionarios();
            
            // Mostrar notificación de éxito
            setNotificacion({
                abierta: true,
                mensaje: isEdicion 
                    ? "Funcionario actualizado exitosamente" 
                    : "Funcionario creado exitosamente",
                tipo: "success"
            });
        } catch (err) {
            console.error("Error al guardar funcionario:", err);
            setNotificacion({
                abierta: true,
                mensaje: err instanceof Error ? err.message : "Error al guardar funcionario",
                tipo: "error"
            });
            throw err;
        }
    };

    // Eliminar funcionario
    const eliminarFuncionario = async () => {
        if (!funcionarioAEliminar) return;

        try {
            const token = getToken();
            if (!token) throw new Error("No se encontró token");

            const response = await fetch(`${API_URL}/funcionarios/${funcionarioAEliminar}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Error al eliminar funcionario");
            }

            // Recargar funcionarios
            await cargarFuncionarios();
            
            // Mostrar notificación de éxito
            setNotificacion({
                abierta: true,
                mensaje: "Funcionario eliminado exitosamente",
                tipo: "success"
            });
        } catch (err) {
            console.error("Error al eliminar funcionario:", err);
            setNotificacion({
                abierta: true,
                mensaje: err instanceof Error ? err.message : "Error al eliminar funcionario",
                tipo: "error"
            });
        } finally {
            cerrarDialogoEliminar();
        }
    };

    // Manejadores para el modal
    const abrirModalAgregar = () => {
        setFuncionarioEditando(null);
        setModalOpen(true);
    };

    const abrirModalEditar = (funcionario: Funcionario) => {
        setFuncionarioEditando(funcionario);
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setFuncionarioEditando(null);
    };

    // Manejadores para el diálogo de eliminar
    const abrirDialogoEliminar = (id: number) => {
        setFuncionarioAEliminar(id);
        setDialogoEliminarAbierto(true);
    };

    const cerrarDialogoEliminar = () => {
        setDialogoEliminarAbierto(false);
        setFuncionarioAEliminar(null);
    };

    // Manejar cambio en la búsqueda
    const manejarCambioBusqueda = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBusqueda(e.target.value);
    };

    // Filtrar funcionarios según la búsqueda
    const funcionariosFiltrados = funcionarios.filter(f => 
        f.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
        f.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
        f.documento.toLowerCase().includes(busqueda.toLowerCase()) ||
        f.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom fontWeight="500" color="primary">
                    Gestión de Funcionarios
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra los funcionarios, instructores y administradores del sistema
                </Typography>
            </Box>
<<<<<<< HEAD

            {/* Barra de acciones */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Buscar funcionario..."
                    value={busqueda}
                    onChange={manejarCambioBusqueda}
                    sx={{ width: 300 }}
                    InputProps={{
                        startAdornment: (
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                <SearchIcon color="action" />
                            </Box>
                        )
                    }}
=======
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Grid2 container spacing={2} marginTop={2}>
              <Grid2 size={12}>
                <DinamicTable
                  rows={rowsForTable}
                  columns={columns}
                  actions={actions}
                  pagination={{ page: 0, pageSize: 10 }}
                  enableCheckboxSelection={false}
                  width="100%"
>>>>>>> edcb8b138396531cf64be50da905655965f27b89
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={abrirModalAgregar}
                >
                    Agregar Funcionario
                </Button>
            </Box>

            {/* Mostrar error si existe */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Tabla de funcionarios */}
            <Paper elevation={3} sx={{ overflow: 'hidden', mb: 4 }}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell width={60}></TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Documento</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Teléfono</TableCell>
                                <TableCell>Roles</TableCell>
                                <TableCell width={140} align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && funcionarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <CircularProgress size={40} />
                                    </TableCell>
                                </TableRow>
                            ) : funcionariosFiltrados.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            No se encontraron funcionarios
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                funcionariosFiltrados.map((funcionario) => (
                                    <TableRow key={funcionario.idFuncionario} hover>
                                        <TableCell>
                                            <Avatar 
                                                src={funcionario.url_imgFuncionario || undefined} 
                                                alt={`${funcionario.nombres} ${funcionario.apellidos}`}
                                                sx={{ width: 40, height: 40 }}
                                            >
                                                {funcionario.nombres.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            {funcionario.nombres} {funcionario.apellidos}
                                        </TableCell>
                                        <TableCell>
                                            {funcionario.abreviatura_tipo_documento || ''} {funcionario.documento}
                                        </TableCell>
                                        <TableCell>{funcionario.email}</TableCell>
                                        <TableCell>{funcionario.telefono}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {funcionario.roles.map((rol) => (
                                                    <Chip
                                                        key={rol.idtipo_funcionario}
                                                        label={rol.tipo_funcionario}
                                                        size="small"
                                                        color={rol.tipo_funcionario === 'instructor' ? "primary" : "secondary"}
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => abrirModalEditar(funcionario)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => abrirDialogoEliminar(funcionario.idFuncionario)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Modal para agregar/editar funcionario */}
            <ModalFuncionario
                open={modalOpen}
                onClose={cerrarModal}
                funcionario={funcionarioEditando}
                onSave={guardarFuncionario}
                title={funcionarioEditando ? "Editar Funcionario" : "Agregar Funcionario"}
            />

            {/* Diálogo de confirmación para eliminar */}
            <Dialog
                open={dialogoEliminarAbierto}
                onClose={cerrarDialogoEliminar}
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro que desea eliminar este funcionario? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialogoEliminar} color="inherit">
                        Cancelar
                    </Button>
                    <Button onClick={eliminarFuncionario} color="error" variant="contained">
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notificaciones */}
            <Snackbar
                open={notificacion.abierta}
                autoHideDuration={6000}
                onClose={() => setNotificacion({ ...notificacion, abierta: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setNotificacion({ ...notificacion, abierta: false })}
                    severity={notificacion.tipo}
                    sx={{ width: '100%' }}
                >
                    {notificacion.mensaje}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default GestionFuncionarios;