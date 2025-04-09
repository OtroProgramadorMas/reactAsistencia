import { Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import Navbar from "../../components/shared/navbar";
import Sidebar from "../../components/admin/sidebar";

import PanelPrincipal from "../../components/admin/panelPrincipal";
import AdminPanel from "../../components/admin/Funcionarios/panelAgregarAdmin";
import ProgramasPanel from "../../components/admin/Sena/panelProgramas";
import FichasPanel from "../../components/admin/Sena/panelFichas";

const AdminHomePage = () => {
  const [selectedOption, setSelectedOption] = useState("Principal");
  const location = useLocation();
  const params = useParams(); // Obtenemos los parámetros de la ruta
  
  // Verificamos si estamos en la ruta de fichas usando params
  const isFichasRoute = location.pathname.includes('/fichas/');
  const programaId = params.id; // ID del programa si estamos en la ruta /admin/fichas/:id
  
  // Extraer parámetros de consulta
  const searchParams = new URLSearchParams(location.search);
  const nombrePrograma = searchParams.get('nombre') || '';
  
  // Si cambia la ruta, actualizamos el estado según corresponda
  useEffect(() => {
    if (!isFichasRoute) {
      // Si regresamos a la página principal, actualizamos selectedOption
      if (location.pathname === '/admin') {
        setSelectedOption("Principal");
      }
    }
  }, [location.pathname, isFichasRoute]);

  const renderPanel = () => {
    // Si estamos en la ruta de fichas, mostramos ese panel independientemente de la opción seleccionada
    if (isFichasRoute && programaId) {
      return <FichasPanel programaId={programaId} nombrePrograma={nombrePrograma} />;
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
      case "Varios":
        return <Typography variant="h4">Panel Varios</Typography>;
      default:
        return <Typography variant="h4">Seleccione una opción</Typography>;
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ height: "64px" }} /> {/* Espacio para navbar fijo */}
      <div style={{ display: "flex" }}>
        <Sidebar onSelect={setSelectedOption} />
        <main>
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {renderPanel()}
          </Box>
        </main>
      </div>
    </>
  );
};

export default AdminHomePage;