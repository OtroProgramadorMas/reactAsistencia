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

const AdminHomePage = () => {
  // Verificamos si hay una opción guardada en localStorage
  const initialOption = localStorage.getItem('adminPanel') || "Principal";
  const [selectedOption, setSelectedOption] = useState(initialOption);
  const location = useLocation();
  const params = useParams(); // Obtenemos los parámetros de la ruta
  
  // Verificamos si estamos en la ruta de fichas o aprendices usando params
  const isFichasRoute = location.pathname.includes('/fichas/');
  const isAprendicesRoute = location.pathname.includes('/aprendices/');
  const id = params.id; // ID del programa o ficha según la ruta
  
  // Extraer parámetros de consulta
  const searchParams = new URLSearchParams(location.search);
  const nombrePrograma = searchParams.get('nombre') || searchParams.get('programa') || '';
  const codigoFicha = searchParams.get('codigo') || 'sin-codigo';
  
  // Si cambia la ruta, actualizamos el estado según corresponda
  useEffect(() => {
    if (!isFichasRoute && !isAprendicesRoute) {
      // Si regresamos a la página principal, verificamos si tenemos una selección guardada
      if (location.pathname === '/admin') {
        const savedOption = localStorage.getItem('adminPanel');
        if (savedOption) {
          setSelectedOption(savedOption);
          // Limpiamos el localStorage después de usarlo
          localStorage.removeItem('adminPanel');
        }
      }
    }
  }, [location.pathname, isFichasRoute, isAprendicesRoute]);

  // Actualizamos la función de selección para que también guarde en localStorage
  const handleSelect = (option: string) => {
    setSelectedOption(option);
    // Opcional: guardar en localStorage para mantener la selección en navegaciones futuras
    localStorage.setItem('adminPanel', option);
  };

  const renderPanel = () => {
    // Si estamos en la ruta de fichas, mostramos ese panel independientemente de la opción seleccionada
    if (isFichasRoute && id) {
      return <FichasPanel programaId={id} nombrePrograma={nombrePrograma} />;
    }
    
    // Si estamos en la ruta de aprendices, mostramos ese panel
    if (isAprendicesRoute && id) {
      return <PanelAprendiz fichaId={id} codigoFicha={codigoFicha} nombrePrograma={nombrePrograma} />;
    }

    // Si no, mostramos el panel correspondiente a la opción seleccionada
    switch (selectedOption) {
      case "Principal":
        return <PanelPrincipal />;
      case "Instructor":
        return <Typography variant="h4">Panel de Instructor</Typography>;
      case "Administrador":
        return <AdminPanel />;
      case "Programa":
        return <ProgramasPanel />;
      default:
        return <Typography variant="h4">Seleccione una opción</Typography>;
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ height: "64px" }} /> {/* Espacio para navbar fijo */}
      <div style={{ display: "flex", width: "90%" }}>
        <Sidebar onSelect={handleSelect} />
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            width: "90%", 
            overflowX: "auto" 
          }}
        >
          {renderPanel()}
        </Box>
      </div>
    </>
  );
};

export default AdminHomePage;