import React, { useState, useEffect } from "react";
import Sidebar from "../../components/instructor/sidebar";
import PanelPrincipal from "../../components/instructor/panelPrincipal";
import PanelInfo from "../../components/instructor/panelRegistroAsistencia";
import Navbar from "../../components/shared/navbar";
import { Box, Typography, IconButton, Button } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

const InstructorHomePage = () => {
  const [selectedView, setSelectedView] = useState<"principal" | "fichas">("principal");
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
  const [dynamicOptions, setDynamicOptions] = useState<{ id: string; label: string }[]>([]);

  const [tutorialMode, setTutorialMode] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  const idFuncionario = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFichas = async () => {
      if (!idFuncionario || !token) {
        console.error("ID de funcionario o token no disponibles");
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/fichas/instructor/${idFuncionario}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Error al obtener fichas");

        const responseData = await response.json();
        const fichas = responseData.data;

        const options = fichas.map((ficha: any) => ({
          id: ficha.idficha.toString(),
          label: `Ficha ${ficha.codigo_ficha}`,
        }));

        setDynamicOptions(options);
      } catch (error) {
        console.error("Error al cargar fichas:", error);
      }
    };

    fetchFichas();
  }, [idFuncionario, token]);

  const handleSelect = (component: "principal" | "fichas", value?: string) => {
    setSelectedView(component);
    setSelectedValue(value);
  };

  const renderContent = () => {
    if (selectedView === "principal") return <PanelPrincipal />;
    if (selectedView === "fichas" && selectedValue) return <PanelInfo value={selectedValue} />;
    return <div>Selecciona una opción</div>;
  };

  const toggleTutorialMode = () => {
    setTutorialMode(!tutorialMode);
    setCurrentTutorialStep(0);
  };

  const tutorialSteps = [
    {
      title: "Panel del Instructor",
      description: "Esta es la página principal donde puedes administrar tus fichas y tomar asistencia.",
      position: { top: '20%', left: '50%' }
    },
    {
      title: "Barra Lateral (Sidebar)",
      description: "Desde aquí puedes seleccionar una ficha o ir al panel principal.",
      position: { top: '50%', left: '15%' }
    },
    {
      title: "Contenido Principal",
      description: "Aquí se muestra la información relacionada con la opción seleccionada.",
      position: { top: '50%', left: '60%' }
    },
  ];

  const handleNextTutorialStep = () => {
    if (currentTutorialStep < tutorialSteps.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    } else {
      setTutorialMode(false);
    }
  };

  return (
    <>
      <Navbar />
      <IconButton 
        onClick={toggleTutorialMode}
        sx={{ 
          position: 'fixed', 
          top: 600,
          right: 124,
          zIndex: 2000,
          color: '#1a237e'
        }}
      >
        <HelpOutlineIcon />
      </IconButton>

      <div style={{ display: "flex" }}>
        <Sidebar dynamicOptions={dynamicOptions} onSelect={handleSelect} />
        <main style={{ flexGrow: 1, padding: "2rem" }}>
          <div style={{ height: "64px" }} />
          {renderContent()}
        </main>
      </div>

      {tutorialMode && (
        <>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 1000,
            }}
            onClick={() => setTutorialMode(false)}
          />
          <Box
            sx={{
              position: 'fixed',
              ...tutorialSteps[currentTutorialStep].position,
              transform: 'translate(-50%, -50%)',
              zIndex: 1200,
              maxWidth: 350,
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: 3,
              p: 3,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {`${currentTutorialStep + 1} de ${tutorialSteps.length}`}
              </Typography>
              <Button
                variant="contained"
                endIcon={<ArrowRightAltIcon />}
                onClick={handleNextTutorialStep}
                sx={{
                  backgroundColor: '#1a237e',
                  '&:hover': {
                    backgroundColor: '#0d1642',
                  },
                }}
              >
                {currentTutorialStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
              </Button>
            </Box>

            <Box
              sx={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '15px solid white',
                bottom: -15,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            />
          </Box>
        </>
      )}
    </>
  );
};

export default InstructorHomePage;
