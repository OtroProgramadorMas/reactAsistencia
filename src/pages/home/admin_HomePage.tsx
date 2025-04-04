import { Box, Typography } from "@mui/material";
import { useState } from "react";
import Navbar from "../../components/shared/navbar";
import Sidebar from "../../components/admin/sidebar"; // Ojo, era 'admin/sidebar' pero en tu archivo es 'shared/sidebar'

import PanelPrincipal from "../../components/admin/panelPrincipal";
import AdminPanel from "../../components/admin/panelAgregarAdmin";

const AdminHomePage = () => {
  const [selectedOption, setSelectedOption] = useState("Principal");

  // Paneles simulados. Puedes reemplazarlos con tus componentes reales.
  const renderPanel = () => {
    switch (selectedOption) {
      case "Principal":
        return <PanelPrincipal/>
      case "Instructor":
        return <Typography variant="h4">Panel de Instructor</Typography>;
      case "Administrador":
        return <AdminPanel/>
      case "Programa":
        return <Typography variant="h4">Panel de Programa</Typography>;
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
