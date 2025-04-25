import React, { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Divider,
    TextField,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    InputAdornment
} from "@mui/material";
import {
    Search as SearchIcon,
    Add as AddIcon,
    Delete as DeleteIcon
} from "@mui/icons-material";
import FuncionarioCard from "./../../shared/paper_funcionario";

const API_URL = "http://localhost:8000";

interface Ficha {
    idficha: number;
    codigo_ficha: string;
    nombre_programa?: string;
}

interface Funcionario {
    idFuncionario: number;
    documento: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    url_imgFuncionario: string | null;
    tipo_documento_idtipo_documento: number;
    abreviatura_tipo_documento?: string;
    roles: {
        idtipo_funcionario: number;
        tipo_funcionario: string;
        password?: string;
    }[];
    fichas?: Ficha[];
}

interface ModalFichasInstructorProps {
    open: boolean;
    onClose: () => void;
    funcionario: Funcionario | null;
    onSave: () => Promise<void>;
}

const ModalFichasInstructor: React.FC<ModalFichasInstructorProps> = ({
    open,
    onClose,
    funcionario,
    onSave
}) => {
    const [todasLasFichas, setTodasLasFichas] = useState<Ficha[]>([]);
    const [fichasDisponibles, setFichasDisponibles] = useState<Ficha[]>([]);
    const [fichasAsignadas, setFichasAsignadas] = useState<Ficha[]>([]);
    const [busquedaDisponibles, setBusquedaDisponibles] = useState<string>("");
    const [busquedaAsignadas, setBusquedaAsignadas] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingFichas, setLoadingFichas] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getToken = (): string | null => localStorage.getItem("token");

    useEffect(() => {
        if (open && funcionario) {
            cargarFichas();
        }
    }, [open, funcionario]);

    useEffect(() => {
        if (funcionario && todasLasFichas.length > 0) {
            const asignadas = funcionario.fichas || [];
            setFichasAsignadas(asignadas);
            const codigosAsignados = new Set(asignadas.map(f => f.codigo_ficha));
            const disponibles = todasLasFichas.filter(f => !codigosAsignados.has(f.codigo_ficha));
            setFichasDisponibles(disponibles);
        }
    }, [funcionario, todasLasFichas]);

    const cargarFichas = async () => {
        setLoadingFichas(true);
        setError(null);

        try {
            const token = getToken();
            if (!token) throw new Error("No se encontró token");

            const response = await fetch(`${API_URL}/fichas`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Error al obtener fichas");

            const data = await response.json();

            if (data.success && data.data) {
                const fichasFormateadas = data.data.map((ficha: any) => ({
                    idficha: ficha.idficha,
                    codigo_ficha: ficha.codigo_ficha,
                    nombre_programa: ficha.nombre_programa || `Ficha ${ficha.codigo_ficha}`
                }));
                setTodasLasFichas(fichasFormateadas);
            } else {
                throw new Error(data.msg || "No se pudieron cargar las fichas");
            }
        } catch (err) {
            console.error("Error al cargar fichas:", err);
            setError(err instanceof Error ? err.message : "Error al cargar fichas");
        } finally {
            setLoadingFichas(false);
        }
    };

    const handleBusquedaDisponiblesChange = (e: React.ChangeEvent<HTMLInputElement>) => setBusquedaDisponibles(e.target.value);
    const handleBusquedaAsignadasChange = (e: React.ChangeEvent<HTMLInputElement>) => setBusquedaAsignadas(e.target.value);

    const fichasDisponiblesFiltradas = fichasDisponibles.filter(f => f.codigo_ficha.includes(busquedaDisponibles) || f.nombre_programa?.toLowerCase().includes(busquedaDisponibles.toLowerCase()));
    const fichasAsignadasFiltradas = fichasAsignadas.filter(f => f.codigo_ficha.includes(busquedaAsignadas) || f.nombre_programa?.toLowerCase().includes(busquedaAsignadas.toLowerCase()));

    const asignarFicha = async (idFicha: number) => {
        if (!funcionario) return;
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) throw new Error("No se encontró token");
            const fichaAAsignar = fichasDisponibles.find(f => f.idficha === idFicha);
            if (!fichaAAsignar) throw new Error("Ficha no encontrada");
            const response = await fetch(`${API_URL}/funcionarios/fichas/asignar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ idFuncionario: funcionario.idFuncionario, idFicha })
            });
            if (!response.ok) throw new Error((await response.json()).msg || "Error al asignar ficha");
            setFichasAsignadas([...fichasAsignadas, fichaAAsignar]);
            setFichasDisponibles(fichasDisponibles.filter(f => f.idficha !== idFicha));
            await onSave();
        } catch (err) {
            console.error("Error al asignar ficha:", err);
            setError(err instanceof Error ? err.message : "Error al asignar ficha");
        } finally {
            setLoading(false);
        }
    };

    const desasignarFicha = async (idFicha: number) => {
        if (!funcionario) return;
        setLoading(true);
        setError(null);
        try {
            const token = getToken();
            if (!token) throw new Error("No se encontró token");
            const fichaADesasignar = fichasAsignadas.find(f => f.idficha === idFicha);
            if (!fichaADesasignar) throw new Error("Ficha no encontrada");
            const response = await fetch(`${API_URL}/funcionarios/fichas/desasignar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ idFuncionario: funcionario.idFuncionario, idFicha })
            });
            if (!response.ok) throw new Error((await response.json()).msg || "Error al desasignar ficha");
            setFichasDisponibles([...fichasDisponibles, fichaADesasignar]);
            setFichasAsignadas(fichasAsignadas.filter(f => f.idficha !== idFicha));
            await onSave();
        } catch (err) {
            console.error("Error al desasignar ficha:", err);
            setError(err instanceof Error ? err.message : "Error al desasignar ficha");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>Gestión de Fichas del Instructor</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {funcionario && (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <FuncionarioCard funcionarioId={funcionario.idFuncionario} maxWidth="100%" maxHeight={250} showTitle={false} />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" gutterBottom color="primary">Fichas Asignadas</Typography>
                                    <TextField fullWidth placeholder="Buscar ficha asignada..." value={busquedaAsignadas} onChange={handleBusquedaAsignadasChange} size="small" sx={{ mb: 2 }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }} />
                                    <Paper variant="outlined" sx={{ mb: 2 }}>
                                        <TableContainer sx={{ maxHeight: 200 }}>
                                            <Table stickyHeader size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>ID</TableCell>
                                                        <TableCell>Código</TableCell>
                                                        <TableCell>Programa</TableCell>
                                                        <TableCell width={60} align="center">Acción</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {loadingFichas ? (
                                                        <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                                                    ) : fichasAsignadasFiltradas.length === 0 ? (
                                                        <TableRow><TableCell colSpan={4} align="center">No hay fichas asignadas</TableCell></TableRow>
                                                    ) : fichasAsignadasFiltradas.map(ficha => (
                                                        <TableRow key={ficha.idficha} hover>
                                                            <TableCell>{ficha.idficha}</TableCell>
                                                            <TableCell>{ficha.codigo_ficha}</TableCell>
                                                            <TableCell>{ficha.nombre_programa || '-'}</TableCell>
                                                            <TableCell align="center">
                                                                <IconButton size="small" color="error" onClick={() => desasignarFicha(ficha.idficha)} disabled={loading}><DeleteIcon fontSize="small" /></IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Box>
                                    <Typography variant="h6" gutterBottom color="primary">Fichas Disponibles</Typography>
                                    <TextField fullWidth placeholder="Buscar ficha disponible..." value={busquedaDisponibles} onChange={handleBusquedaDisponiblesChange} size="small" sx={{ mb: 2 }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }} />
                                    <Paper variant="outlined">
                                        <TableContainer sx={{ maxHeight: 200 }}>
                                            <Table stickyHeader size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>ID</TableCell>
                                                        <TableCell>Código</TableCell>
                                                        <TableCell>Programa</TableCell>
                                                        <TableCell width={60} align="center">Acción</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {loadingFichas ? (
                                                        <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                                                    ) : fichasDisponiblesFiltradas.length === 0 ? (
                                                        <TableRow><TableCell colSpan={4} align="center">No hay fichas disponibles</TableCell></TableRow>
                                                    ) : fichasDisponiblesFiltradas.map(ficha => (
                                                        <TableRow key={ficha.idficha} hover>
                                                            <TableCell>{ficha.idficha}</TableCell>
                                                            <TableCell>{ficha.codigo_ficha}</TableCell>
                                                            <TableCell>{ficha.nombre_programa || '-'}</TableCell>
                                                            <TableCell align="center">
                                                                <IconButton size="small" color="primary" onClick={() => asignarFicha(ficha.idficha)} disabled={loading}><AddIcon fontSize="small" /></IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Paper>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="primary" variant="outlined">Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalFichasInstructor;
