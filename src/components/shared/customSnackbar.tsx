import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export interface CustomSnackbarProps {
  snackbar: SnackbarState;
  handleClose: () => void;
  autoHideDuration?: number;
  anchorVertical?: 'top' | 'bottom';
  anchorHorizontal?: 'left' | 'center' | 'right';
}

/**
 * Componente reutilizable para mostrar notificaciones en forma de Snackbar
 */
const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  snackbar,
  handleClose,
  autoHideDuration = 5000,
  anchorVertical = 'bottom',
  anchorHorizontal = 'center',
}) => {
  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: anchorVertical, horizontal: anchorHorizontal }}
    >
      <Alert 
        onClose={handleClose} 
        severity={snackbar.severity}
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;