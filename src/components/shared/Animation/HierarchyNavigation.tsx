// src/components/shared/HierarchyNavigation.tsx
import React from 'react';
import { Box, Typography, Paper, Grow, Fade, Chip, useTheme } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface HierarchyItemProps {
  icon: React.ReactNode;
  label: string;
  current: boolean;
  route?: string;
  onClick?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

interface HierarchyNavigationProps {
  currentLevel: 'programa' | 'ficha' | 'aprendiz';
  programaId?: string;
  programaNombre?: string;
  fichaId?: string;
  fichaNumero?: string;
  transitionIn?: boolean;
}

const HierarchyItem: React.FC<HierarchyItemProps> = ({ 
  icon, 
  label, 
  current, 
  route,
  onClick,
  isFirst,
  isLast
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (route) {
      navigate(route);
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {!isFirst && (
        <Fade in={true} timeout={800}>
          <ArrowBackIcon 
            fontSize="small" 
            sx={{ 
              mx: 1, 
              color: 'text.secondary',
              display: { xs: 'none', sm: 'block' }
            }} 
          />
        </Fade>
      )}
      
      <Grow in={true} timeout={800} style={{ transformOrigin: 'center' }}>
        <Chip
          icon={icon}
          label={label}
          color={current ? "primary" : "default"}
          variant={current ? "filled" : "outlined"}
          onClick={handleClick}
          sx={{ 
            fontWeight: current ? 'bold' : 'normal',
            cursor: route || onClick ? 'pointer' : 'default',
            fontSize: { xs: '0.7rem', sm: '0.875rem' },
            height: { xs: 28, sm: 32 },
            '& .MuiChip-icon': {
              fontSize: { xs: '1rem', sm: '1.2rem' }
            },
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: current ? theme.palette.primary.main : theme.palette.action.hover,
              transform: 'scale(1.05)'
            }
          }}
        />
      </Grow>
      
      {!isLast && (
        <Fade in={true} timeout={800}>
          <ArrowForwardIcon 
            fontSize="small" 
            sx={{ 
              mx: 1, 
              color: 'text.secondary',
              display: { xs: 'none', sm: 'block' }
            }} 
          />
        </Fade>
      )}
    </Box>
  );
};

const HierarchyNavigation: React.FC<HierarchyNavigationProps> = ({
  currentLevel,
  programaId,
  programaNombre = "Programa",
  fichaId,
  fichaNumero = "Ficha",
  transitionIn = true
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const getBackRoute = () => {
    switch (currentLevel) {
      case 'ficha':
        return '/admin';
      case 'aprendiz':
        return programaId 
          ? `/admin/fichas/${programaId}?nombre=${encodeURIComponent(programaNombre)}` 
          : '/admin';
      default:
        return '/admin';
    }
  };
  
  // Direcciones para las flechas de navegación
  const getArrowDirections = () => {
    switch (currentLevel) {
      case 'programa': return { left: false, right: true };
      case 'ficha': return { left: true, right: true };
      case 'aprendiz': return { left: true, right: false };
      default: return { left: false, right: false };
    }
  };
  
  const arrowDirections = getArrowDirections();
  
  return (
    <Fade in={transitionIn} timeout={500}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: { xs: 1, sm: 0 },
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}50, ${theme.palette.primary.main}, ${theme.palette.primary.main}50)`,
            zIndex: 1,
            animation: currentLevel !== 'programa' ? 'flowLeft 2s infinite linear' : 'flowRight 2s infinite linear',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main}50, ${theme.palette.primary.main}, ${theme.palette.primary.main}50)`,
            zIndex: 1,
            animation: currentLevel !== 'aprendiz' ? 'flowRight 2s infinite linear' : 'flowLeft 2s infinite linear',
          },
          '@keyframes flowRight': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
          },
          '@keyframes flowLeft': {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(-100%)' }
          }
        }}
      >
        {/* Flecha animada izquierda */}
        {arrowDirections.left && (
          <Box 
            sx={{ 
              position: 'absolute', 
              left: 10, 
              top: '50%', 
              transform: 'translateY(-50%)',
              display: { xs: 'none', md: 'block' },
              animation: 'pulseLeft 1.5s infinite ease-in-out',
              '@keyframes pulseLeft': {
                '0%': { transform: 'translateY(-50%) translateX(0)' },
                '50%': { transform: 'translateY(-50%) translateX(-5px)' },
                '100%': { transform: 'translateY(-50%) translateX(0)' }
              }
            }}
          >
            <ArrowBackIcon color="primary" />
          </Box>
        )}
        
        {/* Flecha animada derecha */}
        {arrowDirections.right && (
          <Box 
            sx={{ 
              position: 'absolute', 
              right: 10, 
              top: '50%', 
              transform: 'translateY(-50%)',
              display: { xs: 'none', md: 'block' },
              animation: 'pulseRight 1.5s infinite ease-in-out',
              '@keyframes pulseRight': {
                '0%': { transform: 'translateY(-50%) translateX(0)' },
                '50%': { transform: 'translateY(-50%) translateX(5px)' },
                '100%': { transform: 'translateY(-50%) translateX(0)' }
              }
            }}
          >
            <ArrowForwardIcon color="primary" />
          </Box>
        )}
        
        <HierarchyItem
          icon={<SchoolIcon />}
          label={programaNombre || "Programas"}
          current={currentLevel === 'programa'}
          route="/admin"
          isFirst={true}
          isLast={currentLevel === 'programa'}
        />
        
        {(currentLevel === 'ficha' || currentLevel === 'aprendiz') && (
          <HierarchyItem
            icon={<ClassIcon />}
            label={fichaNumero || "Ficha"}
            current={currentLevel === 'ficha'}
            route={programaId ? `/admin/fichas/${programaId}?nombre=${encodeURIComponent(programaNombre)}` : undefined}
            isFirst={false}
            isLast={currentLevel === 'ficha'}
          />
        )}
        
        {currentLevel === 'aprendiz' && (
          <HierarchyItem
            icon={<PersonIcon />}
            label="Aprendices"
            current={true}
            isFirst={false}
            isLast={true}
          />
        )}
        
        <Fade in={true} timeout={1200}>
          <Typography 
            variant="caption" 
            sx={{ 
              ml: { xs: 0, sm: 2 },
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            {currentLevel === 'programa' ? 'Nivel de Programa' : 
              currentLevel === 'ficha' ? 'Nivel de Ficha' : 'Nivel de Aprendiz'}
          </Typography>
        </Fade>
      </Paper>
    </Fade>
  );
};

export default HierarchyNavigation;