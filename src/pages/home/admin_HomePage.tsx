import { Box, Typography, IconButton, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

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

  const isFichasRoute = location.pathname.includes('/fichas/');
  const isAprendicesRoute = location.pathname.includes('/aprendices/');
  const id = params.id;
  
  const searchParams = new URLSearchParams(location.search);
  const nombrePrograma = searchParams.get('nombre') || searchParams.get('programa') || '';
  const codigoFicha = searchParams.get('codigo') || 'sin-codigo';

  const [tutorialMode, setTutorialMode] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  
  // Estado para controlar la dirección de la transición
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');
  
  // Estado para controlar la transición entre vistas
  const [transitionKey, setTransitionKey] = useState<string>('');
  
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

  const tutorialSteps = [
    {
      title: "Vista de Administrador",
      description: "Desde aquí puedes gestionar instructores, programas, fichas y aprendices del sistema.",
      position: { top: "30%", left: "50%" },
    },
    {
      title: "Menú Lateral",
      description: "Este es el menú principal. Usa estas opciones para navegar entre las diferentes funciones del sistema.",
      position: { top: "50%", left: "15%" },
    },
    {
      title: "Área de Trabajo",
      description: "Aquí se carga la vista del panel que hayas seleccionado en el menú lateral.",
      position: { top: "50%", left: "70%" },
    },
  ];

  const toggleTutorialMode = () => {
    setTutorialMode(!tutorialMode);
    setCurrentTutorialStep(0);
  };

  const handleNextTutorialStep = () => {
    if (currentTutorialStep < tutorialSteps.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    } else {
      setTutorialMode(false);
    }
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

    if (isAprendicesRoute && id) {
      return <PanelAprendiz fichaId={id} codigoFicha={codigoFicha} nombrePrograma={nombrePrograma} />;
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
      <IconButton
        onClick={toggleTutorialMode}
        sx={{
          position: "fixed",
          top: 600,
          right: 124,
          zIndex: 1300,
          color: "#1a237e",
        }}
      >
        <HelpOutlineIcon />
      </IconButton>
      <div style={{ height: "64px" }} /> {/* Espacio para navbar fijo */}
      <div style={{ display: "flex", width: "90%" }}>
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

      {/* Tutorial Overlay */}
      {tutorialMode && (
        <>
          {/* Capa oscura */}
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              zIndex: 1000,
            }}
            onClick={() => setTutorialMode(false)}
          />

          {/* Ventana de tutorial */}
          <Box
            sx={{
              position: "fixed",
              ...tutorialSteps[currentTutorialStep].position,
              transform: "translate(-50%, -50%)",
              zIndex: 1200,
              display: "flex",
              flexDirection: "column",
              maxWidth: 350,
              backgroundColor: "white",
              borderRadius: 2,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" fontWeight="bold" color="#1a237e">
                {tutorialSteps[currentTutorialStep].title}
              </Typography>
              <IconButton size="small" onClick={toggleTutorialMode}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Typography variant="body2" sx={{ mb: 2 }}>
              {tutorialSteps[currentTutorialStep].description}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {`${currentTutorialStep + 1} de ${tutorialSteps.length}`}
              </Typography>

              <Button
                variant="contained"
                endIcon={<ArrowRightAltIcon />}
                onClick={handleNextTutorialStep}
                sx={{
                  backgroundColor: "#1a237e",
                  "&:hover": {
                    backgroundColor: "#0d1642",
                  },
                }}
              >
                {currentTutorialStep === tutorialSteps.length - 1 ? "Finalizar" : "Siguiente"}
              </Button>
            </Box>

            {/* Flecha apuntando */}
            <Box
              sx={{
                position: "absolute",
                width: 0,
                height: 0,
                borderLeft: "10px solid transparent",
                borderRight: "10px solid transparent",
                borderTop: "15px solid white",
                bottom: -15,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default AdminHomePage;
