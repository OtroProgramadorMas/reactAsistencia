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
    InputAdornment
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

interface Ficha {
    idficha: number;
    codigo_ficha: string;
    nombre_programa?: string;
}

interface Rol {
    idtipo_funcionario: number;
    tipo_funcionario: string;
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
        password: "",
        url_imgFuncionario: null as string | null,
        tipo_documento_idtipo_documento: 1, // Valor por defecto
    });

    // Estados para roles y fichas seleccionados
    const [rolSeleccionado, setRolSeleccionado] = useState<number>(1); // Default: Instructor
    const [fichaSeleccionada, setFichaSeleccionada] = useState<number | "">("");

    // Estados para opciones disponibles
    const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
    const [fichas, setFichas] = useState<Ficha[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);

    // Estados para UI
    const [loading, setLoading] = useState<boolean>(false);
    const [cargandoImagen, setCargandoImagen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isInstructor, setIsInstructor] = useState<boolean>(true); // Por defecto instructor
    const [imagenCargada, setImagenCargada] = useState<boolean>(false);

    // Obtener token de autenticación
    const getToken = (): string | null => localStorage.getItem("token");

    // Cargar datos cuando el componente se monta
    useEffect(() => {
        if (open) {
            fetchTiposDocumento();
            fetchRoles();
            fetchFichas();
            resetForm();

            // Si estamos editando, preparar los datos existentes
            if (funcionario) {
                prepararDatosEdicion();
            }
        }
    }, [open, funcionario]);

    // Verificar si el rol es instructor - MEJORADO
    useEffect(() => {
        if (roles.length === 0) return; // No hacer nada si no hay roles cargados

        const rolInfo = roles.find(r => r.idtipo_funcionario === rolSeleccionado);

        // Convertir a minúsculas para comparación insensible a mayúsculas/minúsculas
        const esTipoInstructor = rolInfo?.tipo_funcionario.toLowerCase() === 'instructor';
        
        setIsInstructor(esTipoInstructor);
    }, [rolSeleccionado, roles]);

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            idFuncionario: undefined,
            documento: "",
            nombres: "",
            apellidos: "",
            email: "",
            telefono: "",
            password: "",
            url_imgFuncionario: null,
            tipo_documento_idtipo_documento: 1,
        });
        setRolSeleccionado(1); // Default: Instructor
        setFichaSeleccionada("");
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
            password: "", // No mostramos la contraseña existente por seguridad
            url_imgFuncionario: funcionario.url_imgFuncionario,
            tipo_documento_idtipo_documento: funcionario.tipo_documento_idtipo_documento || 1,
        });

        // Preparar URL de previsualización (corregido)
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

        // Preparar rol (tomamos el primero si hay varios)
        if (funcionario.roles && funcionario.roles.length > 0) {
            setRolSeleccionado(funcionario.roles[0].idtipo_funcionario);
        }

        // Preparar ficha (tomamos la primera si hay varias)
        if (funcionario.fichas && funcionario.fichas.length > 0) {
            // Si la ficha viene como un objeto con idficha
            if (typeof funcionario.fichas[0] === 'object' && funcionario.fichas[0].idficha) {
                setFichaSeleccionada(funcionario.fichas[0].idficha);
            }
            // Si la ficha viene como un id directo
            else if (typeof funcionario.fichas[0] === 'number') {
                setFichaSeleccionada(funcionario.fichas[0]);
            }
            // Si la ficha viene como código de ficha
            else if (typeof funcionario.fichas[0] === 'object' && funcionario.fichas[0].codigo_ficha) {
                // Buscar la ficha correspondiente en el array de fichas cargadas
                const fichaEncontrada = fichas.find(f => f.codigo_ficha === funcionario.fichas[0].codigo_ficha);
                if (fichaEncontrada) {
                    setFichaSeleccionada(fichaEncontrada.idficha);
                }
            }
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
                // Loguear los roles para depuración
                console.log("Roles cargados:", data.roles);
                setRoles(data.roles);

                // Verificar el rol seleccionado actual después de cargar los roles
                const rolActual = data.roles.find((r: Rol) => r.idtipo_funcionario === rolSeleccionado);
                console.log("Rol seleccionado actual:", rolActual);

                // Actualizar isInstructor basado en el rol seleccionado
                if (rolActual) {
                    setIsInstructor(rolActual.tipo_funcionario.toLowerCase() === 'instructor');
                }
            } else {
                throw new Error(data.msg || "No se pudieron cargar los roles");
            }
        } catch (err) {
            console.error("Error al cargar roles:", err);
            setError(err instanceof Error ? err.message : "Error al cargar roles");
        }
    };

    // Obtener fichas disponibles
    const fetchFichas = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error("No se encontró token");

            const response = await fetch(`${API_URL}/tipofichacargo`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener fichas");

            const data = await response.json();

            if (data.success && data.tipoFichas) {
                console.log("Fichas cargadas:", data.tipoFichas);
                // Transformar los datos al formato esperado
                const fichasFormateadas = data.tipoFichas.map((ficha: any) => ({
                    idficha: ficha.idficha || ficha.codigo_ficha,
                    codigo_ficha: ficha.codigo_ficha,
                    nombre_programa: ficha.nombre_programa || `Ficha ${ficha.codigo_ficha}`
                }));
                setFichas(fichasFormateadas);
            } else {
                throw new Error(data.msg || "No se pudieron cargar las fichas");
            }
        } catch (err) {
            console.error("Error al cargar fichas:", err);
            setError(err instanceof Error ? err.message : "Error al cargar fichas");
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

    // Manejar cambio de rol
    const handleRolChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        const value = e.target.value as number;
        setRolSeleccionado(value);

        // Verificar si es instructor
        const rolInfo = roles.find(r => r.idtipo_funcionario === value);

        // Actualización directa de isInstructor para respuesta inmediata de UI
        const esTipoInstructor = rolInfo?.tipo_funcionario.toLowerCase() === 'instructor';
        setIsInstructor(esTipoInstructor);

        // Si no es instructor, limpiar la ficha seleccionada
        if (!esTipoInstructor) {
            setFichaSeleccionada("");
        }
    };

    // Manejar cambio de ficha
    const handleFichaChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
        setFichaSeleccionada(e.target.value as number);
    };

    // Mostrar/ocultar contraseña
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
    };

    // Manejo de errores en carga de imagen
    const handleImageError = () => {
        console.error("Error al cargar la imagen del funcionario");
        // No mostrar la URL con error, mostrar la inicial
        setImagenCargada(false);
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

            // Preparar datos para enviar al API
            const apiData: FuncionarioApiData = {
                funcionario: {
                    ...formData,
                    // Añadir ID solo si estamos editando
                    ...(formData.idFuncionario !== undefined && { idFuncionario: formData.idFuncionario }),
                    // Actualizar la URL de la imagen con la nueva ruta
                    tipo_documento_idtipo_documento: Number(formData.tipo_documento_idtipo_documento)
                },
                roles: [{
                    idRol: rolSeleccionado,
                    password: formData.password
                }],
            };

            // Agregar ficha solo si el rol es instructor y hay una ficha seleccionada
            if (isInstructor && fichaSeleccionada !== "") {
                apiData.fichas = [Number(fichaSeleccionada)];
            }

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

                            {/* Campo de contraseña general */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Contraseña"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    margin="normal"
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            {/* Selección de rol */}
                            <Grid item xs={12}>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Rol</InputLabel>
                                    <Select
                                        value={rolSeleccionado}
                                        onChange={handleRolChange}
                                        label="Rol"
                                    >
                                        {roles.map((rol) => (
                                            <MenuItem
                                                key={rol.idtipo_funcionario}
                                                value={rol.idtipo_funcionario}
                                            >
                                                {rol.tipo_funcionario}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Mostrar selección de ficha solo si el rol es instructor */}
                            {isInstructor && (
                                <Grid item xs={12}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel>Ficha a Cargo</InputLabel>
                                        <Select
                                            value={fichaSeleccionada}
                                            onChange={handleFichaChange}
                                            label="Ficha a Cargo"
                                        >
                                            <MenuItem value="">
                                                <em>Ninguna</em>
                                            </MenuItem>
                                            {fichas.map((ficha) => (
                                                <MenuItem
                                                    key={ficha.idficha}
                                                    value={ficha.idficha}
                                                >
                                                    {ficha.codigo_ficha} {ficha.nombre_programa ? `- ${ficha.nombre_programa}` : ''}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
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