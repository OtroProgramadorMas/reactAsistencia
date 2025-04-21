// src/pages/AdminHomePage.tsx
import { Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "../../components/shared/navbar";
import Sidebar from "../../components/admin/sidebar";

import PanelPrincipal from "../../components/admin/panelPrincipal";
import AdminPanel from "../../components/admin/Funcionarios/panelFuncionarios";
import ProgramasPanel from "../../components/admin/Sena/panelProgramas";
import FichasPanel from "../../components/admin/Sena/panelFichas";
import PanelAprendiz from "../../components/admin/Sena/panelAprendiz";
import PageTransition from "../../components/shared/Animation/PageTransition";

const AdminHomePage = () => {
  const initialOption = localStorage.getItem('adminPanel') || "Principal";
  const [selectedOption, setSelectedOption] = useState(initialOption);
  const location = useLocation();
  const params = useParams();
  
  // Estado para controlar la dirección de la transición
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');
  
  // Estado para controlar la transición entre vistas
  const [transitionKey, setTransitionKey] = useState<string>('');

  const isFichasRoute = location.pathname.includes('/fichas/');
  const isAprendicesRoute = location.pathname.includes('/aprendices/');
  const id = params.id;

  const searchParams = new URLSearchParams(location.search);
  const nombrePrograma = searchParams.get('nombre') || searchParams.get('programa') || '';
  const codigoFicha = searchParams.get('codigo') || 'sin-codigo';
  
  // Efecto para actualizar la key de transición cuando cambia la ruta o la opción seleccionada
  useEffect(() => {
    if (isFichasRoute) {
      setTransitionKey(`fichas-${id}`);
      setTransitionDirection('left');
    } else if (isAprendicesRoute) {
      setTransitionKey(`aprendices-${id}`);
      setTransitionDirection('left');
    } else {
      setTransitionKey(`panel-${selectedOption}`);
      setTransitionDirection('right');
    }
  }, [isFichasRoute, isAprendicesRoute, id, selectedOption]);

  useEffect(() => {
    if (!isFichasRoute && !isAprendicesRoute) {
      if (location.pathname === '/admin') {
        const savedOption = localStorage.getItem('adminPanel');
        if (savedOption) {
          setSelectedOption(savedOption);
          localStorage.removeItem('adminPanel');
        }
      }
    }
  }, [location.pathname, isFichasRoute, isAprendicesRoute]);

  const handleSelect = (option: string) => {
    // Determinar la dirección de la transición basada en el cambio de nivel
    const currentLevel = isFichasRoute ? 'ficha' : isAprendicesRoute ? 'aprendiz' : 'programa';
    const goingToLevel = option === 'Organizacion' ? 'programa' : 'otro';
    
    if (currentLevel === 'ficha' || currentLevel === 'aprendiz') {
      setTransitionDirection('right');
    } else {
      setTransitionDirection('left');
    }
    
    setSelectedOption(option);
    localStorage.setItem('adminPanel', option);
  };

  const renderPanel = () => {
    if (isFichasRoute && id) {
      return (
        <PageTransition key={`fichas-${id}`} direction={transitionDirection}>
          <FichasPanel programaId={id} nombrePrograma={nombrePrograma} />
        </PageTransition>
      );
    }

    if (isAprendicesRoute && id) {
      return (
        <PageTransition key={`aprendices-${id}`} direction={transitionDirection}>
          <PanelAprendiz fichaId={id} codigoFicha={codigoFicha} nombrePrograma={nombrePrograma} />
        </PageTransition>
      );
    }

    switch (selectedOption) {
      case "Principal":
        return (
          <PageTransition key="panel-principal" direction={transitionDirection}>
            <PanelPrincipal />
          </PageTransition>
        );
      case "Funcionario":
        return (
          <PageTransition key="panel-funcionario" direction={transitionDirection}>
            <AdminPanel />
          </PageTransition>
        );
      case "Organizacion":
        return (
          <PageTransition key="panel-organizacion" direction={transitionDirection}>
            <ProgramasPanel />
          </PageTransition>
        );
      default:
        return (
          <PageTransition key="panel-default" direction={transitionDirection}>
            <Typography variant="h4">Seleccione una opción</Typography>
          </PageTransition>
        );
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ height: "64px" }} />
      <div style={{ display: "flex", width: "100%" }}>
        <Sidebar onSelect={handleSelect} />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            width: "100%", 
            overflowX: "auto",
            overflowY: "hidden" // Importante para las animaciones
          }}
        >
          {renderPanel()}
        </Box>
      </div>
    </>
  );
};

export default AdminHomePage;