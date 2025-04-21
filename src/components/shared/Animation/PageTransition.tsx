// src/components/shared/PageTransition.tsx
import React, { useState, useEffect } from 'react';
import { Box, Fade, Slide, SlideProps } from '@mui/material';

interface PageTransitionProps {
  children: React.ReactNode;
  direction?: SlideProps['direction'];
  timeout?: number;
  key?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  direction = 'right',
  timeout = 500,
  key
}) => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    // Pequeño delay para asegurar que la animación sea visible
    const timer = setTimeout(() => {
      setShow(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        overflow: 'hidden'
      }}
      key={key}
    >
      <Fade in={show} timeout={timeout}>
        <Box>
          <Slide direction={direction} in={show} timeout={timeout}>
            <Box>
              {children}
            </Box>
          </Slide>
        </Box>
      </Fade>
    </Box>
  );
};

export default PageTransition;