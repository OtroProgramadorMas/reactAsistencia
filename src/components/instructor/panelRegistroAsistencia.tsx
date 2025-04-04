import React, { useState, useEffect } from "react";
import DinamicTable from "../shared/dataTable";
import { Button, Radio, RadioGroup, FormControlLabel, Paper, Typography } from "@mui/material";

type Asistencia = {
  id: number;
  aprendiz: string;
  documento: string;
  estado: "Presente" | "Ausente" | "Justificado";
  estadoTemporal?: string; // Para cambios no enviados
};

const PanelRegistroAsistencia = ({ value }: { value: string }) => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]); // Formato YYYY-MM-DD

  // Datos de ejemplo (en producción, usa una API)
  useEffect(() => {
    const mockData: Asistencia[] = [
      { id: 1, aprendiz: "Juan Pérez", documento: "123456789", estado: "Presente" },
      { id: 2, aprendiz: "María Gómez", documento: "987654321", estado: "Ausente" },
    ];
    setAsistencias(mockData);
  }, [value]);

  // Manejar cambios en los radiobuttons
  const handleEstadoChange = (id: number, nuevoEstado: string) => {
    setAsistencias(prev => 
      prev.map(item => 
        item.id === id ? { ...item, estadoTemporal: nuevoEstado } : item
      )
    );
  };

  // Enviar datos a la API
  const enviarAsistencias = async () => {
    const datosParaEnviar = asistencias.map(item => ({
      fichaId: value, // ID de la ficha desde las props
      aprendizId: item.id,
      documento: item.documento,
      fecha: fecha, // Fecha actual o seleccionada
      estado: item.estadoTemporal || item.estado, // Usa el temporal si existe
    }));

    try {
      const response = await fetch("http://localhost:8000/asistencias/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosParaEnviar),
      });
      if (!response.ok) throw new Error("Error al guardar");
      alert("Asistencias registradas!");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Columnas para la tabla
  const columns: GridColDef[] = [
    { field: "aprendiz", headerName: "Aprendiz", width: 200 },
    { field: "documento", headerName: "Documento", width: 130 },
    {
      field: "estado",
      headerName: "Estado",
      width: 250,
      renderCell: (params) => (
        <RadioGroup
          row
          value={params.row.estadoTemporal || params.row.estado}
          onChange={(e) => handleEstadoChange(params.row.id, e.target.value)}
        >
          <FormControlLabel value="Presente" control={<Radio />} label="Presente" />
          <FormControlLabel value="Ausente" control={<Radio />} label="Ausente" />
          <FormControlLabel value="Justificado" control={<Radio />} label="Justificado" />
        </RadioGroup>
      ),
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Registro de Asistencia - Ficha {value} ({fecha})
      </Typography>

      {/* Selector de fecha (opcional) */}
      <input 
        type="date" 
        value={fecha} 
        onChange={(e) => setFecha(e.target.value)} 
        style={{ marginBottom: "16px" }}
      />

      <DinamicTable 
        rows={asistencias} 
        columns={columns} 
        pagination={{ page: 0, pageSize: 5 }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={enviarAsistencias}
        sx={{ mt: 2 }}
      >
        Guardar Asistencias
      </Button>
    </Paper>
  );
};

export default PanelRegistroAsistencia;