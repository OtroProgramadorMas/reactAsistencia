import React, { useState, useEffect } from "react";
import Sidebar from "../../components/instructor/sidebar";
import PanelPrincipal from "../../components/instructor/panelPrincipal";
import PanelInfo from "../../components/instructor/panelRegistroAsistencia";
import Navbar from "../../components/shared/navbar";

const InstructorHomePage = () => {
  const [selectedView, setSelectedView] = useState<"principal" | "fichas">("principal");
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);
  const [dynamicOptions, setDynamicOptions] = useState<{ id: string; label: string }[]>([]);
  
  // Obtener datos del usuario desde localStorage
const idFuncionario = localStorage.getItem("id");
  const token = localStorage.getItem("token"); // Token de autenticación

  useEffect(() => {
    const fetchFichas = async () => {
      if (!idFuncionario || !token) {
        console.error("ID de funcionario o token no disponibles");
        return;
      }
    
      try {
        const response = await fetch(`http://localhost:8000/ficha_func/${idFuncionario}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          throw new Error("Error al obtener fichas");
        }
    
        const responseData = await response.json();
        const fichas = responseData.data; // Acceder al array dentro de la propiedad 'data'
    
        // Convertir fichas en opciones dinámicas para el sidebar
        const options = fichas.map((ficha: any) => ({
          id: ficha.idficha.toString(),
          label: `Ficha ${ficha.codigo_ficha}`, // Usar codigo_ficha en lugar de codigo
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

  return (
    <>
      <Navbar userType="aprendiz"/>
      <div style={{ display: "flex" }}>
        <Sidebar dynamicOptions={dynamicOptions} onSelect={handleSelect} />
        <main style={{ flexGrow: 1, padding: "2rem" }}>
          <div style={{ height: "64px" }} /> {/* Espacio para navbar fijo */}
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default InstructorHomePage;
