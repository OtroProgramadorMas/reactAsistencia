import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  CircularProgress, 
  Box, 
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { 
  School as SchoolIcon,
  Code as CodeIcon,
  VerifiedUser as VerifiedUserIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

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
  maxWidth?: number | string;
  maxHeight?: number | string;
  showTitle?: boolean;
}

const FichaPaper: React.FC<FichaPaperProps> = ({ 
  fichaId, 
  maxWidth = 300, 
  maxHeight = 'auto',
  showTitle = true
}) => {
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Token no encontrado');
      setLoading(false);
      return;
    }

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
        setError((err as Error).message);
        setFicha(null);
      })
      .finally(() => setLoading(false));
  }, [fichaId]);

  return (
    <Card sx={{ maxWidth, maxHeight, overflow: 'hidden', boxShadow: 3, height: '100%' }}>
      {showTitle && (
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Información de Ficha
          </Typography>
        </Box>
      )}
      
      <CardContent sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : !ficha ? (
          <Alert severity="warning">No se encontró información de la ficha</Alert>
        ) : (
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              {ficha.nombre_programa}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CodeIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
              <Typography variant="body2">
                {ficha.codigo_ficha}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <VerifiedUserIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
              <Typography variant="body2">
                {ficha.estado_ficha}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
              <Typography variant="body2">
                {new Date(ficha.fecha_inicio).toLocaleDateString('es-ES')}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FichaPaper;