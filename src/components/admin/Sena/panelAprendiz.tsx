import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { GridColDef } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import DinamicTable from "../../shared/dataTable";
import CustomSnackbar from "../../shared/customSnackbar";
import useSnackbar from "../../shared/useSnackbar";

// Interfaz del aprendiz, adaptada según el modelo
interface Aprendiz {
  idaprendiz: number;
  nombres_aprendiz: string;
  apellidos_aprendiz: string;
  documento_aprendiz: string;
  email_aprendiz: string;
  ficha_idficha: number;
  id?: number; // para DataGrid
}

interface AprendizPanelProps {
  fichaId: string;
  codigoFicha: string;
  nombrePrograma: string;
}

const PanelAprendiz: React.FC<AprendizPanelProps> = ({ fichaId, codigoFicha, nombrePrograma }) => {
  const navigate = useNavigate();
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { snackbar, showSnackbar, closeSnackbar } = useSnackbar();

  const fetchAprendices = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:8000/aprendices/ficha/${fichaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.aprendices)) {
        const aprendicesConId = data.aprendices.map((a: any) => ({
          ...a,
          id: a.idaprendiz
        }));
        setAprendices(aprendicesConId);
      } else {
        showSnackbar("No se pudieron cargar los aprendices", "error");
      }
    } catch (err) {
      console.error("Error al obtener aprendices:", err);
      showSnackbar("Error al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate(-1);
  };

  useEffect(() => {
    fetchAprendices();
  }, [fichaId]);

  const columns: GridColDef[] = [
    { field: "idaprendiz", headerName: "ID", width: 80 },
    { field: "nombres_aprendiz", headerName: "Nombre", width: 150 },
    { field: "apellidos_aprendiz", headerName: "Apellido", width: 150 },
    { field: "documento_aprendiz", headerName: "Documento", width: 150 },
    { field: "email_aprendiz", headerName: "Correo", width: 200 },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleVolver}
        >
          Volver
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Lista de Aprendices
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Ficha: {codigoFicha} - Programa: {nombrePrograma}
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DinamicTable
          rows={aprendices}
          columns={columns}
          pagination={{ page: 0, pageSize: 10 }}
        />
      )}

      <CustomSnackbar snackbar={snackbar} handleClose={closeSnackbar} />
    </Paper>
  );
};

export default PanelAprendiz;