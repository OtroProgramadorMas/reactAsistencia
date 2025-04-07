import React, { useState, useEffect } from "react";
import DinamicTable from "../shared/dataTable";
import {
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import FichaPaper from "../../components/shared/paper_ficha"; // Asegúrate de que la ruta es correcta

type Asistencia = {
  id: number;
  aprendiz: string;
  documento: string;
  estado: "Presente" | "Ausente" | "Justificado";
  estadoTemporal?: string;
};

const PanelRegistroAsistencia = ({ value }: { value: string }) => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const mockData: Asistencia[] = [
      { id: 1, aprendiz: "Juan Pérez", documento: "123456789", estado: "Presente" },
      { id: 2, aprendiz: "María Gómez", documento: "987654321", estado: "Ausente" },
    ];
    setAsistencias(mockData);
  }, [value]);

  const handleEstadoChange = (id: number, nuevoEstado: string) => {
    setAsistencias((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, estadoTemporal: nuevoEstado } : item
      )
    );
  };

  const enviarAsistencias = async () => {
    const datosParaEnviar = asistencias.map((item) => ({
      fichaId: value,
      aprendizId: item.id,
      documento: item.documento,
      fecha: fecha,
      estado: item.estadoTemporal || item.estado,
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

  const columns = [
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
    <>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2} mb={3}>
        {/* Selector de fecha a la izquierda */}
        <Box>
          <Typography variant="h6" gutterBottom>Fecha:</Typography>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </Box>
  
        {/* FichaPaper a la derecha */}
        <FichaPaper fichaId={Number(value)} />
      </Box>
  
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Registro de Asistencia ({fecha})
        </Typography>
  
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
    </>
  );
  
};

export default PanelRegistroAsistencia;
