import { useState } from 'react';
import { AlertColor } from '@mui/material';
import { SnackbarState } from './CustomSnackbar';

/**
 * Hook personalizado para gestionar el estado y funciones de un Snackbar
 * @returns Un objeto con el estado del snackbar y funciones para mostrarlo y cerrarlo
 */
const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  /**
   * Muestra un mensaje en el Snackbar
   * @param message Mensaje a mostrar
   * @param severity Tipo de alerta (success, error, info, warning)
   */
  const showSnackbar = (message: string, severity: AlertColor = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  /**
   * Cierra el Snackbar
   */
  const closeSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return {
    snackbar,
    showSnackbar,
    closeSnackbar,
  };
};

export default useSnackbar;