import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Box
} from "@mui/material";
import { 
  Person as PersonIcon, 
  Email as EmailIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon
} from "@mui/icons-material";

// API URL base - adding this like in the other components
const API_URL = "http://localhost:8000";

export interface FuncionarioConRol {
  idFuncionario: number | null;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgFuncionario: string | null;
  id_tipoDocumento: number;
  abreviatura_tipo_documento?: string;
  tipo_documento?: string;
  roles: {
    idtipo_funcionario: number;
    tipo_funcionario: string;
    password: string;
  }[];
}

interface FuncionarioCardProps {
  funcionarioId: number | string | null;
  maxWidth?: number | string;
  maxHeight?: number | string;
  showTitle?: boolean;
}

const FuncionarioCard: React.FC<FuncionarioCardProps> = ({
  funcionarioId,
  maxWidth = 300,
  maxHeight = "auto",
  showTitle = true
}) => {
  const [user, setUser] = useState<FuncionarioConRol | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagenCargada, setImagenCargada] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No hay información de autenticación.");
        }

        const response = await fetch(`${API_URL}/funcionarios/${funcionarioId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener los datos del funcionario");
        }

        const data = await response.json();
        setUser(data.funcionario);

        // Preparar URL de previsualización de imagen, similar al modal
        if (data.funcionario.url_imgFuncionario) {
          // Si la ruta no comienza con http, debemos concatenar la URL base
          if (!data.funcionario.url_imgFuncionario.startsWith('http')) {
            setPreviewUrl(`${API_URL}${data.funcionario.url_imgFuncionario}`);
          } else {
            setPreviewUrl(data.funcionario.url_imgFuncionario);
          }
          setImagenCargada(true);
        } else {
          setPreviewUrl(null);
          setImagenCargada(false);
        }

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [funcionarioId]);

  // Formato completo del documento con abreviatura si está disponible
  const getDocumentoCompleto = () => {
    if (!user) return '';
    return user.abreviatura_tipo_documento 
      ? `${user.abreviatura_tipo_documento} ${user.documento}`
      : user.documento;
  };

  // Manejo de errores en carga de imagen
  const handleImageError = () => {
    console.error("Error al cargar la imagen del funcionario");
    setImagenCargada(false);
  };

  return (
    <Card sx={{ maxWidth, maxHeight, overflow: 'hidden', boxShadow: 3, height: '100%' }}>
      {showTitle && (
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Información del Funcionario
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
        ) : !user ? (
          <Alert severity="warning">No se encontró información del funcionario</Alert>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            {/* Información del funcionario */}
            <Box sx={{ flexGrow: 1, pr: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {user.nombres} {user.apellidos}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                <Typography variant="body2">
                  {getDocumentoCompleto()}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                <Typography variant="body2" noWrap>
                  {user.email}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                <Typography variant="body2">
                  {user.telefono}
                </Typography>
              </Box>
              
              {user.roles.map((role, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: index === user.roles.length - 1 ? 0 : 1 }}>
                  <StarIcon sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                  <Typography variant="body2">
                    {role.tipo_funcionario}
                  </Typography>
                </Box>
              ))}
            </Box>
            
            {/* Foto del perfil con manejo mejorado y manejo de errores como en modalFuncionario */}
            <Avatar
              src={previewUrl}
              sx={{ width: 70, height: 70, ml: 'auto' }}
              imgProps={{
                onError: handleImageError
              }}
            >
              {!imagenCargada && user.nombres
                ? user.nombres.charAt(0).toUpperCase()
                : "F"}
            </Avatar>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FuncionarioCard;