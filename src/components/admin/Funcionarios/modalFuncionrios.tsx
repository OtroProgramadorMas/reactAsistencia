import React, { useState, useEffect } from "react";
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Grid,
    Avatar,
    Typography,
    CircularProgress,
    Alert,
    IconButton,
    InputAdornment,
    Checkbox,
    FormGroup,
    FormControlLabel,
    Paper,
    Collapse
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// API URL base
const API_URL = "http://localhost:8000";

// Interfaces
interface TipoDocumento {
    idtipo_documento: number;
    tipo_documento: string;
}

interface Rol {
    idtipo_funcionario: number;
    tipo_funcionario: string;
}

// Interfaz para roles seleccionados con contraseña
interface RolSeleccionado {
    idRol: number;
    tipo_funcionario: string; // Añadido para mostrar nombre
    password: string;
    mostrarPassword: boolean; // Para control de visibilidad
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
        password?: string; // Ya no se usa este campo general
        url_imgFuncionario?: string | null;
        tipo_documento_idtipo_documento: number;
    };
    roles: { idRol: number; password: string }[];
}

// Props para el componente
interface ModalFuncionarioProps {
    open: boolean;
    onClose: () => void;
    funcionario?: any; // Objeto funcionario para edición
    onSave: (data: FuncionarioApiData, file: File | null) => Promise<void>;
    title: string;
}

const ModalFuncionario: React.FC<ModalFuncionarioProps> = ({
    open,
    onClose,
    funcionario,
    onSave,
    title
}) => {
    // Estado para los datos básicos del funcionario
    const [formData, setFormData] = useState({
        idFuncionario: undefined as number | undefined,
        documento: "",
        nombres: "",
        apellidos: "",
        email: "",
        telefono: "",
        url_imgFuncionario: null as string | null,
        tipo_documento_idtipo_documento: 1, // Valor por defecto
    });

    // Estados para roles seleccionados
    const [rolesSeleccionados, setRolesSeleccionados] = useState<RolSeleccionado[]>([]);

    // Estados para opciones disponibles
    const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);

    // Estados para UI
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imagenCargada, setImagenCargada] = useState<boolean>(false);

    // Obtener token de autenticación
    const getToken = (): string | null => localStorage.getItem("token");

    // Cargar datos cuando el componente se monta
    useEffect(() => {
        if (open) {
            fetchTiposDocumento();
            fetchRoles();
            resetForm();

            // Si estamos editando, preparar los datos existentes
            if (funcionario) {
                prepararDatosEdicion();
            }
        }
    }, [open, funcionario]);

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            idFuncionario: undefined,
            documento: "",
            nombres: "",
            apellidos: "",
            email: "",
            telefono: "",
            url_imgFuncionario: null,
            tipo_documento_idtipo_documento: 1,
        });
        setRolesSeleccionados([]);
        setFile(null);
        setPreviewUrl(null);
        setError(null);
        setImagenCargada(false);
    };

    // Preparar datos para la edición
    const prepararDatosEdicion = () => {
        if (!funcionario) return;

        // Preparar datos básicos
        setFormData({
            idFuncionario: funcionario.idFuncionario,
            documento: funcionario.documento || "",
            nombres: funcionario.nombres || "",
            apellidos: funcionario.apellidos || "",
            email: funcionario.email || "",
            telefono: funcionario.telefono || "",
            url_imgFuncionario: funcionario.url_imgFuncionario,
            tipo_documento_idtipo_documento: funcionario.tipo_documento_idtipo_documento || 1,
        });

        // Preparar URL de previsualización
        if (funcionario.url_imgFuncionario) {
            // Si la ruta no comienza con http, debemos concatenar la URL base
            if (!funcionario.url_imgFuncionario.startsWith('http')) {
                setPreviewUrl(`${API_URL}${funcionario.url_imgFuncionario}`);
            } else {
                setPreviewUrl(funcionario.url_imgFuncionario);
            }
            setImagenCargada(true);
        } else {
            setPreviewUrl(null);
            setImagenCargada(false);
        }

        // Preparar roles (ahora múltiples con contraseñas individuales)
        if (funcionario.roles && funcionario.roles.length > 0) {
            const rolesPreparados = funcionario.roles.map((rol: any) => ({
                idRol: rol.idtipo_funcionario,
                tipo_funcionario: rol.tipo_funcionario,
                password: rol.password || "",
                mostrarPassword: false
            }));
            setRolesSeleccionados(rolesPreparados);
        }
    };

    // Obtener tipos de documento
    const fetchTiposDocumento = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error("No se encontró token");

            const response = await fetch(`${API_URL}/tipoDocumento`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener tipos de documento");

            const data = await response.json();

            if (data.success && data.tipoDocumento) {
                setTiposDocumento(data.tipoDocumento);
            } else {
                throw new Error(data.msg || "No se pudieron cargar los tipos de documento");
            }
        } catch (err) {
            console.error("Error al cargar tipos de documento:", err);
            setError(err instanceof Error ? err.message : "Error al cargar datos");
        }
    };

    // Obtener roles disponibles
    const fetchRoles = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error("No se encontró token");

            const response = await fetch(`${API_URL}/funcionarios/roles`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener roles");

            const data = await response.json();

            if (data.success && data.roles) {
                setRoles(data.roles);
            } else {
                throw new Error(data.msg || "No se pudieron cargar los roles");
            }
        } catch (err) {
            console.error("Error al cargar roles:", err);
            setError(err instanceof Error ? err.message : "Error al cargar roles");
        }
    };

    // Manejar cambios en los campos del formulario básico
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
    ) => {
        const { name, value } = e.target;
        if (name) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB en bytes
    const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
    
    // Manejar cambio de archivo de imagen
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;

        // Limpiar error previo
        setError(null);

        if (!selectedFile) return;

        // Validar tipo de archivo
        if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
            setError('Solo se permiten archivos JPG y PNG');
            return;
        }

        // Validar tamaño
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError(`La imagen excede el tamaño máximo de 2MB`);
            return;
        }

        setFile(selectedFile);
        setImagenCargada(true);

        // Crear URL de vista previa
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    // Manejar selección de roles con checkboxes
    const handleRolChange = (rol: Rol, isChecked: boolean) => {
        if (isChecked) {
            // Agregar rol si no existe
            if (!rolesSeleccionados.some(r => r.idRol === rol.idtipo_funcionario)) {
                setRolesSeleccionados([
                    ...rolesSeleccionados,
                    {
                        idRol: rol.idtipo_funcionario,
                        tipo_funcionario: rol.tipo_funcionario,
                        password: "",
                        mostrarPassword: false
                    }
                ]);
            }
        } else {
            // Eliminar rol
            setRolesSeleccionados(rolesSeleccionados.filter(
                r => r.idRol !== rol.idtipo_funcionario
            ));
        }
    };

    // Manejar cambio de contraseña para un rol específico
    const handleRolPasswordChange = (idRol: number, password: string) => {
        setRolesSeleccionados(prevRoles => 
            prevRoles.map(rol => 
                rol.idRol === idRol ? { ...rol, password } : rol
            )
        );
    };

    // Manejar visibilidad de contraseña para un rol
    const handleRolPasswordVisibility = (idRol: number) => {
        setRolesSeleccionados(prevRoles => 
            prevRoles.map(rol => 
                rol.idRol === idRol ? { ...rol, mostrarPassword: !rol.mostrarPassword } : rol
            )
        );
    };

    // Manejo de errores en carga de imagen
    const handleImageError = () => {
        console.error("Error al cargar la imagen del funcionario");
        setImagenCargada(false);
    };

    // Verificar si un rol está seleccionado
    const isRolSelected = (idRol: number): boolean => {
        return rolesSeleccionados.some(r => r.idRol === idRol);
    };

    // Enviar el formulario
    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            // Validar datos requeridos
            if (!formData.documento || !formData.nombres || !formData.apellidos || !formData.email || !formData.telefono) {
                throw new Error("Por favor complete todos los campos obligatorios");
            }

            // Validar que se seleccionó al menos un rol
            if (rolesSeleccionados.length === 0) {
                throw new Error("Debe seleccionar al menos un rol");
            }

            // Validar que todos los roles tengan contraseña
            for (const rol of rolesSeleccionados) {
                if (!rol.password.trim()) {
                    throw new Error(`Debe ingresar una contraseña para el rol de ${rol.tipo_funcionario}`);
                }
            }

            // Preparar datos para enviar al API
            const apiData: FuncionarioApiData = {
                funcionario: {
                    ...formData,
                    // Añadir ID solo si estamos editando
                    ...(formData.idFuncionario !== undefined && { idFuncionario: formData.idFuncionario }),
                    tipo_documento_idtipo_documento: Number(formData.tipo_documento_idtipo_documento)
                },
                roles: rolesSeleccionados.map(rol => ({
                    idRol: rol.idRol,
                    password: rol.password
                }))
            };

            console.log("Datos a enviar:", apiData);
            await onSave(apiData, file);
            onClose();
        } catch (err) {
            console.error("Error al guardar funcionario:", err);
            setError(err instanceof Error ? err.message : "Error al guardar funcionario");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            scroll="paper"
        >
            <DialogTitle
                sx={{
                    backgroundColor: "primary.main",
                    color: "white",
                    mb: 2
                }}
            >
                {title}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* Sección para la foto */}
                    <Grid item xs={12} md={4}>
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            p={2}
                        >
                            <Avatar
                                src={previewUrl}
                                sx={{ width: 150, height: 150, mb: 2 }}
                                imgProps={{
                                    onError: handleImageError
                                }}
                            >
                                {!imagenCargada && formData.nombres
                                    ? formData.nombres.charAt(0).toUpperCase()
                                    : "F"}
                            </Avatar>

                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                sx={{ mt: 2 }}
                            >
                                Subir Foto
                                <input
                                    hidden
                                    accept="image/*"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                            </Button>
                            <Typography variant="caption" sx={{ mt: 1, textAlign: "center" }}>
                                Formatos permitidos: JPG, PNG (máx. 2MB)
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Sección para los datos */}
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Tipo de Documento</InputLabel>
                                    <Select
                                        name="tipo_documento_idtipo_documento"
                                        value={formData.tipo_documento_idtipo_documento}
                                        onChange={handleChange}
                                        label="Tipo de Documento"
                                    >
                                        {tiposDocumento.map((tipo) => (
                                            <MenuItem
                                                key={tipo.idtipo_documento}
                                                value={tipo.idtipo_documento}
                                            >
                                                {tipo.tipo_documento}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Número de Documento"
                                    name="documento"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nombres"
                                    name="nombres"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Apellidos"
                                    name="apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Correo Electrónico"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Teléfono"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                    required
                                />
                            </Grid>

                            {/* Sección de roles con checkboxes */}
                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                                    <Typography variant="subtitle1" gutterBottom fontWeight="500">
                                        Roles del Funcionario
                                    </Typography>
                                    <FormGroup>
                                        {roles.map((rol) => (
                                            <Box key={rol.idtipo_funcionario} sx={{ mb: 2 }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={isRolSelected(rol.idtipo_funcionario)}
                                                            onChange={(e) => handleRolChange(rol, e.target.checked)}
                                                        />
                                                    }
                                                    label={rol.tipo_funcionario}
                                                />
                                                <Collapse in={isRolSelected(rol.idtipo_funcionario)}>
                                                    <Box sx={{ pl: 4, pr: 2, mt: 1 }}>
                                                        <TextField
                                                            fullWidth
                                                            label={`Contraseña para ${rol.tipo_funcionario}`}
                                                            type={rolesSeleccionados.find(r => r.idRol === rol.idtipo_funcionario)?.mostrarPassword ? "text" : "password"}
                                                            value={rolesSeleccionados.find(r => r.idRol === rol.idtipo_funcionario)?.password || ""}
                                                            onChange={(e) => handleRolPasswordChange(rol.idtipo_funcionario, e.target.value)}
                                                            variant="outlined"
                                                            size="small"
                                                            required
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={() => handleRolPasswordVisibility(rol.idtipo_funcionario)}
                                                                            edge="end"
                                                                            size="small"
                                                                        >
                                                                            {rolesSeleccionados.find(r => r.idRol === rol.idtipo_funcionario)?.mostrarPassword ? <VisibilityOff /> : <Visibility />}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                        />
                                                    </Box>
                                                </Collapse>
                                            </Box>
                                        ))}
                                    </FormGroup>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit" disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                >
                    {loading ? "Guardando..." : "Guardar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalFuncionario;