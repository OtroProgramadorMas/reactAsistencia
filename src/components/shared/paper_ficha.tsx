import React, { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress, Box } from '@mui/material';

interface Ficha {
  idficha: number;
  codigo_ficha: string;
  fecha_inicio: string;
  programa_idprograma: number;
  estado_ficha_idestado_ficha: number;
  idestado_ficha: number;
  estado_ficha: string;
  nombre_programa: string;
}

interface FichaPaperProps {
  fichaId: number;
}

const FichaPaper: React.FC<FichaPaperProps> = ({ fichaId }) => {
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Token no encontrado');
      return;
    }

    setLoading(true);
    fetch(`http://localhost:8000/fichas/${fichaId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener ficha');
        return res.json();
      })
      .then((data) => {
        if (data.success && data.ficha) {
          setFicha(data.ficha);
        } else {
          throw new Error('Estructura de respuesta no válida');
        }
      })
      .catch((err) => {
        console.error(err);
        setFicha(null);
      })
      .finally(() => setLoading(false));
  }, [fichaId]);

  return (
    <Paper elevation={4} sx={{ padding: 4, maxWidth: 600, borderRadius: 2 }}>
      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : ficha ? (
        <>
          <Typography variant="h5" gutterBottom>
            Ficha N°{ficha.codigo_ficha}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Programa:</strong> {ficha.nombre_programa}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Fecha de inicio:</strong> {new Date(ficha.fecha_inicio).toLocaleDateString()}
          </Typography>
        </>
      ) : (
        <Typography color="error">No se pudo cargar la ficha.</Typography>
      )}
    </Paper>
  );
};

export default FichaPaper;