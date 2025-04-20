import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import UpdateIcon from '@mui/icons-material/Update';

interface ControlBotonesAsistenciaProps {
  fecha: string;
  idAprendices: number[];
  fichaId: number;
  estadosAsistencia: { [key: number]: number };
  existenRegistros: boolean;
  onCompletado: () => void;
  showSnackbar: (mensaje: string, tipo: "success" | "error") => void;
}

const ControlBotonesAsistencia: React.FC<ControlBotonesAsistenciaProps> = ({
  fecha,
  idAprendices,
  fichaId,
  estadosAsistencia,
  existenRegistros,
  onCompletado,
  showSnackbar
}) => {
  const [guardando, setGuardando] = useState<boolean>(false);

  // URL base para todas las peticiones
  const BASE_URL = "http://localhost:8000";

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      // Validar que se hayan seleccionado tipos de asistencia
      const cantidadSeleccionados = Object.keys(estadosAsistencia).length;
      if (cantidadSeleccionados === 0) {
        throw new Error("No se ha seleccionado ningún tipo de asistencia");
      }

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
        showSnackbar(
          `Asistencias guardadas correctamente para ${cantidadSeleccionados} aprendices`, 
          "success"
        );
        onCompletado();
      } else {
        throw new Error(data.msg || "Error al guardar");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      showSnackbar(`Error al guardar asistencias: ${errorMsg}`, "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleActualizar = async () => {
    setGuardando(true);
    try {
      // Validar que se hayan seleccionado tipos de asistencia
      const cantidadSeleccionados = Object.keys(estadosAsistencia).length;
      if (cantidadSeleccionados === 0) {
        throw new Error("No se ha seleccionado ningún tipo de asistencia");
      }

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
        showSnackbar(
          `Asistencias actualizadas correctamente para ${cantidadSeleccionados} aprendices`, 
          "success"
        );
        onCompletado();
      } else {
        throw new Error(data.msg || "Error al actualizar");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      showSnackbar(`Error al actualizar asistencias: ${errorMsg}`, "error");
    } finally {
      setGuardando(false);
    }
  };

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