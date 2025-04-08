// src/components/Navbar.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

interface NavbarProps {
  userType?: 'instructor' | 'funcionario' | 'aprendiz';
  userName?: string;
}

const Navbar: React.FC<NavbarProps> = ({ userType, userName }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Eliminar token del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');

    // Redirigir al login
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    //Redirigir al perfil según el tipo de usuario
    
    navigate(`/${userType}/perfil`);
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        {/* Logo del proyecto - puedes reemplazar con tu imagen */}
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Box component="span" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
            Edu
          </Box>
          <Box component="span" sx={{ fontWeight: 'bold' }}>
            Platform
          </Box>
        </Typography>

        {/* Menú de usuario */}
        <div>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            {userName ? (
              <Avatar sx={{ width: 32, height: 32 }}>
                {userName.charAt(0).toUpperCase()}
              </Avatar>
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleProfile}>
              <AccountCircle sx={{ mr: 1 }} /> Mi Perfil
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToAppIcon sx={{ mr: 1 }} /> Salir
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;