import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import FichaPaper from '../../shared/paper_ficha';
import FuncionarioCard from '../../shared/paper_funcionario';

// API URL base
const API_URL = "http://localhost:8000";

interface ModalAsignacionInstructorProps {
  open: boolean;
  onClose: () => void;
  fichaId: number | null;
  onSave: (fichaId: number, funcionarioId: number) => Promise<void>;
}

const ModalAsignacionInstructor: React.FC<ModalAsignacionInstructorProps> = ({
  open,
  onClose,
  fichaId,
  onSave
}) => {
  // Estados
  const [documentoBusqueda, setDocumentoBusqueda] = useState<string>("");
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null);
  const [loadingFuncionario, setLoadingFuncionario] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loadingSave, setLoadingSave] = useState<boolean>(false);

  // Resetear estado cuando se abre/cierra el modal
  useEffect(() => {
    if (!open) {
      setDocumentoBusqueda("");
      setFuncionarioId(null);
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  // Obtener token de autenticación
  const getToken = (): string | null => localStorage.getItem("token");

  // Buscar funcionario por documento usando el endpoint específico para instructores
  const buscarFuncionario = async () => {
    if (!documentoBusqueda.trim()) {
      setError("Ingrese un número de documento para buscar");
      return;
    }

    setLoadingFuncionario(true);
    setError(null);
    setSuccess(null);
    setFuncionarioId(null);

    try {
      const token = getToken();
      if (!token) throw new Error("No se encontró token de autenticación");

      // Usando el endpoint específico para buscar instructores
      const response = await fetch(`${API_URL}/instructor/${documentoBusqueda.trim()}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success && data.idInstructor) {
        // El endpoint ya verifica que sea instructor y devuelve directamente su ID
        setFuncionarioId(data.idInstructor);
        setSuccess("Instructor encontrado correctamente");
      } else {
        setError(data.msg || "No se encontró ningún instructor con ese documento");
      }
    } catch (err) {
      console.error("Error al buscar instructor:", err);
      setError(err instanceof Error ? err.message : "Error al buscar instructor");
    } finally {
      setLoadingFuncionario(false);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!fichaId || !funcionarioId) {
      setError("Se requiere una ficha y un instructor válidos para realizar la asignación");
      return;
    }

    setLoadingSave(true);
    setError(null);

    try {
      await onSave(fichaId, funcionarioId);
      onClose();
    } catch (err) {
      console.error("Error al asignar instructor:", err);
      setError(err instanceof Error ? err.message : "Error al asignar instructor a la ficha");
    } finally {
      setLoadingSave(false);
    }
  };

  // Manejar tecla Enter en campo de búsqueda
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      buscarFuncionario();
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
        Asignación de Instructor a Ficha
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Sección izquierda: Información de la ficha */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Información de la Ficha
            </Typography>
            <Box sx={{ height: '100%', minHeight: '250px' }}>
              {fichaId ? (
                <FichaPaper 
                  fichaId={fichaId} 
                  maxWidth="100%" 
                  maxHeight="100%" 
                  showTitle={true}
                />
              ) : (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'background.default' 
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No se ha seleccionado ninguna ficha
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>

          {/* Sección derecha: Búsqueda y detalles del funcionario */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Buscar Instructor
            </Typography>
            
            {/* Buscador de funcionario */}
            <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Documento del Instructor"
                variant="outlined"
                value={documentoBusqueda}
                onChange={(e) => setDocumentoBusqueda(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {loadingFuncionario && <CircularProgress size={20} />}
                      {funcionarioId && !loadingFuncionario && (
                        <CheckCircleIcon color="success" />
                      )}
                      {error && !loadingFuncionario && (
                        <ErrorIcon color="error" />
                      )}
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={buscarFuncionario}
                disabled={loadingFuncionario}
                startIcon={<SearchIcon />}
              >
                Buscar
              </Button>
            </Box>

            {/* Información del funcionario */}
            <Box sx={{ height: '100%', minHeight: '200px' }}>
              {funcionarioId ? (
                <FuncionarioCard 
                  funcionarioId={funcionarioId} 
                  maxWidth="100%" 
                  maxHeight="100%"
                  showTitle={true} 
                />
              ) : (
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'background.default' 
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Busque un instructor por su número de documento
                  </Typography>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit" disabled={loadingSave}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!fichaId || !funcionarioId || loadingSave}
          startIcon={loadingSave && <CircularProgress size={20} />}
        >
          {loadingSave ? "Guardando..." : "Asignar Instructor"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalAsignacionInstructor;