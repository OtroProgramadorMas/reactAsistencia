import React, { useState, useEffect } from 'react';
import { Button, CircularProgress, Box, Alert } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UpdateIcon from '@mui/icons-material/Update';

interface ControlBotonesAsistenciaProps {
  fecha: string;
  idAprendices: number[];
  fichaId: number;
  estadosAsistencia: { [key: number]: number };
  onCompletado: () => void;
}

const ControlBotonesAsistencia: React.FC<ControlBotonesAsistenciaProps> = ({
  fecha,
  idAprendices,
  fichaId,
  estadosAsistencia,
  onCompletado
}) => {
  const [existenRegistros, setExistenRegistros] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  // URL base para todas las peticiones
  const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const verificarRegistros = async () => {
      if (!fecha || idAprendices.length === 0) return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No se encontró token");

        // Usar el nuevo endpoint para verificar asistencias
        const response = await fetch(`${BASE_URL}/asistencia/verificar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fecha,
            idFicha: fichaId
          })
        });

        if (!response.ok) throw new Error("Error al verificar asistencias");

        const data = await response.json();
        setExistenRegistros(data.existenAsistencias);
      } catch (err) {
        console.error("Error verificando asistencias:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    verificarRegistros();
  }, [fecha, idAprendices, fichaId]);

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No se encontró token");

      // Transformar el objeto de estados a un array de asistencias
      const asistenciasArray = Object.entries(estadosAsistencia).map(([idAprendiz, idTipoAsistencia]) => ({
        idAprendiz: Number(idAprendiz),
        idTipoAsistencia: Number(idTipoAsistencia)
      }));

      // Usar el nuevo endpoint para guardar asistencias masivas
      const response = await fetch(`${BASE_URL}/asistencias/masiva`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          asistencias: asistenciasArray,
          fecha
        })
      });

      if (!response.ok) throw new Error("Error al guardar asistencias");

      const data = await response.json();
      if (data.success) {
        setExistenRegistros(true);
        onCompletado();
      } else {
        throw new Error(data.msg || "Error al guardar");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizar = async () => {
    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No se encontró token");

      // Transformar el objeto de estados a un array de asistencias
      const asistenciasArray = Object.entries(estadosAsistencia).map(([idAprendiz, idTipoAsistencia]) => ({
        idAprendiz: Number(idAprendiz),
        idTipoAsistencia: Number(idTipoAsistencia)
      }));

      // Usar el nuevo endpoint para actualizar asistencias masivas
      const response = await fetch(`${BASE_URL}/asistencias/masiva`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          asistencias: asistenciasArray,
          fecha
        })
      });

      if (!response.ok) throw new Error("Error al actualizar asistencias");

      const data = await response.json();
      if (data.success) {
        onCompletado();
      } else {
        throw new Error(data.msg || "Error al actualizar");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <CircularProgress size={30} />;

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
      {existenRegistros ? (
        <Button
          variant="contained"
          color="primary"
          startIcon={<UpdateIcon />}
          onClick={handleActualizar}
          disabled={guardando}
        >
          {guardando ? "Actualizando..." : "Actualizar Asistencia"}
        </Button>
      ) : (
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar Asistencia"}
        </Button>
      )}
    </Box>
  );
};

export default ControlBotonesAsistencia;