import React, { useState } from 'react';
import { 
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';

// Definición de tipos
type AlertType = 'success' | 'info' | 'warning' | 'error';

interface RecuperarPasswordProps {
  onClose: () => void;
}

const RecuperarPassword: React.FC<RecuperarPasswordProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoAlerta, setTipoAlerta] = useState<AlertType>('info');
  const [openAlerta, setOpenAlerta] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Ingreso email, 2: Código verificación, 3: Nueva contraseña
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  const handleEnviarEmail = async () => {
    if (!email) {
      mostrarAlerta('Por favor ingrese su correo electrónico', 'error');
      return;
    }
  
    setLoading(true);
    try {
      console.log("Enviando solicitud con email:", email);
      
      // OPCIÓN 1: Conectar con el backend real
      try {
        const response = await fetch('http://localhost:8000/auth/recuperar-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email: email.trim() }) // Enviar email limpio
        });
  
        console.log("Respuesta de la API:", response.status, response.statusText);
        
        // Intenta leer la respuesta como texto primero
        const text = await response.text();
        console.log("Respuesta texto:", text);
        
        // Luego intenta parsearla como JSON
        let data;
        try {
          data = JSON.parse(text);
          console.log("Respuesta JSON:", data);
        } catch (e) {
          console.error("Error al parsear respuesta como JSON:", e);
          // Si hay error de parseo, seguimos con texto
          data = { success: false, msg: "Error al procesar la respuesta del servidor" };
        }
        
        if (response.ok) {
          mostrarAlerta('Se ha enviado un código de verificación a su correo', 'success');
          
          // En desarrollo, si el backend devuelve el código, guardarlo localmente
          if (data.devInfo && data.devInfo.codigo) {
            console.log("Código de desarrollo recibido:", data.devInfo.codigo);
            localStorage.setItem('dev_recovery_code', data.devInfo.codigo);
          }
          
          setPaso(2);
        } else {
          mostrarAlerta(data.msg || 'Error al enviar el correo', 'error');
        }
      } catch (apiError) {
        console.error("Error al conectar con API:", apiError);
        
        // OPCIÓN 2: Fallback para desarrollo si la API falla
        console.log("Usando modo de desarrollo como fallback");
        const codigoSimulado = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("Código simulado para desarrollo:", codigoSimulado);
        localStorage.setItem('dev_recovery_code', codigoSimulado);
        
        mostrarAlerta(`MODO DESARROLLO: Se generó un código de verificación (ver consola)`, 'info');
        setPaso(2);
      }
    } catch (error) {
      console.error("Error completo:", error);
      mostrarAlerta('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerificarCodigo = async () => {
    if (!codigo) {
      mostrarAlerta('Por favor ingrese el código de verificación', 'error');
      return;
    }
  
    setLoading(true);
    try {
      // OPCIÓN 1: Verificar con el backend real
      try {
        const response = await fetch('http://localhost:8000/auth/verificar-codigo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email: email.trim(), codigo: codigo.trim() })
        });
  
        // Intenta leer la respuesta como texto primero
        const text = await response.text();
        console.log("Respuesta texto:", text);
        
        // Luego intenta parsearla como JSON
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Error al parsear respuesta como JSON:", e);
          data = { success: false, msg: "Error al procesar la respuesta del servidor" };
        }
        
        if (response.ok) {
          mostrarAlerta('Código verificado correctamente', 'success');
          setPaso(3);
        } else {
          mostrarAlerta(data.msg || 'Código inválido', 'error');
        }
      } catch (apiError) {
        console.error("Error al conectar con API de verificación:", apiError);
        
        // OPCIÓN 2: Verificación local para desarrollo
        const codigoAlmacenado = localStorage.getItem('dev_recovery_code');
        if (codigo === codigoAlmacenado) {
          mostrarAlerta('Código verificado correctamente (modo desarrollo)', 'success');
          setPaso(3);
        } else {
          console.log(`Código ingresado: ${codigo}, código esperado: ${codigoAlmacenado}`);
          mostrarAlerta('Código inválido (modo desarrollo)', 'error');
        }
      }
    } catch (error) {
      console.error("Error completo:", error);
      mostrarAlerta('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCambiarPassword = async () => {
    if (!nuevaPassword || !confirmarPassword) {
      mostrarAlerta('Por favor complete todos los campos', 'error');
      return;
    }
  
    if (nuevaPassword !== confirmarPassword) {
      mostrarAlerta('Las contraseñas no coinciden', 'error');
      return;
    }
  
    if (nuevaPassword.length < 6) {
      mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
  
    setLoading(true);
    try {
      // OPCIÓN 1: Cambiar contraseña con el backend real
      try {
        const response = await fetch('http://localhost:8000/auth/cambiar-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            email: email.trim(), 
            codigo: codigo.trim(), 
            nuevaPassword 
          })
        });
  
        // Intenta leer la respuesta como texto primero
        const text = await response.text();
        console.log("Respuesta texto:", text);
        
        // Luego intenta parsearla como JSON
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error("Error al parsear respuesta como JSON:", e);
          data = { success: false, msg: "Error al procesar la respuesta del servidor" };
        }
        
        if (response.ok) {
          mostrarAlerta('Contraseña actualizada correctamente', 'success');
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          mostrarAlerta(data.msg || 'Error al cambiar la contraseña', 'error');
        }
      } catch (apiError) {
        console.error("Error al conectar con API de cambio de contraseña:", apiError);
        
        // OPCIÓN 2: Simulación para desarrollo
        const codigoAlmacenado = localStorage.getItem('dev_recovery_code');
        if (codigo === codigoAlmacenado) {
          // Simular éxito en modo desarrollo
          localStorage.removeItem('dev_recovery_code'); // Limpiar código usado
          mostrarAlerta('Contraseña actualizada correctamente (modo desarrollo)', 'success');
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          mostrarAlerta('Error: Código incorrecto (modo desarrollo)', 'error');
        }
      }
    } catch (error) {
      console.error("Error completo:", error);
      mostrarAlerta('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarAlerta = (mensaje: string, tipo: AlertType) => {
    setMensaje(mensaje);
    setTipoAlerta(tipo);
    setOpenAlerta(true);
  };

  const cerrarAlerta = () => {
    setOpenAlerta(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
        Recuperar Contraseña
      </Typography>

      {paso === 1 && (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Ingrese su correo electrónico para recibir instrucciones de recuperación de contraseña.
          </Typography>
          <TextField
            fullWidth
            label="Correo Electrónico"
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleEnviarEmail}
            disabled={loading}
            sx={{ 
              py: 1.5,
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#3949ab' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Código'}
          </Button>
        </Box>
      )}

      {paso === 2 && (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Ingrese el código de verificación enviado a su correo electrónico.
          </Typography>
          <TextField
            fullWidth
            label="Código de Verificación"
            variant="outlined"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleVerificarCodigo}
            disabled={loading}
            sx={{ 
              py: 1.5,
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#3949ab' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Verificar Código'}
          </Button>
        </Box>
      )}

      {paso === 3 && (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Ingrese su nueva contraseña.
          </Typography>
          <TextField
            fullWidth
            label="Nueva Contraseña"
            variant="outlined"
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Confirmar Contraseña"
            variant="outlined"
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleCambiarPassword}
            disabled={loading}
            sx={{ 
              py: 1.5,
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#3949ab' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Cambiar Contraseña'}
          </Button>
        </Box>
      )}

      <Grid container justifyContent="center" sx={{ mt: 2 }}>
        <Button 
          variant="text" 
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          Cancelar
        </Button>
      </Grid>

      <Snackbar open={openAlerta} autoHideDuration={6000} onClose={cerrarAlerta}>
        <Alert onClose={cerrarAlerta} severity={tipoAlerta} sx={{ width: '100%' }}>
          {mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecuperarPassword;