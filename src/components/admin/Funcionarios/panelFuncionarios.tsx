import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  Grid2,
  CircularProgress
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DinamicTable from "../../shared/dataTable";

// API URL base
const API_URL = 'http://localhost:8000';

interface Funcionario {
  idFuncionario: number;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgFuncionario: string | null;
  tipo_documento: string;
  abreviatura_tipo_documento: string;
  roles: {
    idtipo_funcionario: number;
    tipo_funcionario: string;
  }[];
}

const PanelAdmin: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener token de autenticación
  const getToken = (): string | null => localStorage.getItem('token');

  // Cargar funcionarios desde la API
  useEffect(() => {
    const fetchFuncionarios = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getToken();
        if (!token) throw new Error("No se encontró token");

        const response = await fetch(`${API_URL}/funcionarios`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Error al obtener funcionarios");

        const data = await response.json();

        if (data.success && data.funcionarios) {
          setFuncionarios(data.funcionarios);
        } else {
          throw new Error(data.msg || "No se pudieron cargar los funcionarios");
        }
      } catch (err) {
        console.error("Error al cargar funcionarios:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setFuncionarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFuncionarios();
  }, []);

  // Transformar los datos para la tabla
  const rowsForTable = funcionarios.map(func => ({
    id: func.idFuncionario,
    img: func.url_imgFuncionario,
    nombre: `${func.nombres} ${func.apellidos}`,
    documento: `${func.abreviatura_tipo_documento} ${func.documento}`,
    email: func.email,
    telefono: func.telefono,
    roles: func.roles.map(rol => rol.tipo_funcionario).join(", ")
  }));

  // Manejadores de acciones (sin funcionalidad real)
  const handleEdit = (row: any) => {
    console.log("Editar funcionario:", row);
    // Aquí iría la lógica de edición
  };

  const handleDelete = (row: any) => {
    console.log("Eliminar funcionario:", row);
    // Aquí iría la lógica de eliminación
  };

  // Configuración de columnas para la tabla
  const columns = [
    {
      field: "img",
      headerName: "Imagen",
      width: 80,
      renderCell: (params: any) => (
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: '#e0e0e0'
          }}
        >
          {params.value ? (
            <img
              src={params.value}
              alt="Foto"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              {params.row.nombre.charAt(0).toUpperCase()}
            </Typography>
          )}
        </Box>
      )
    },
    { field: "nombre", headerName: "Nombre", width: 250 },
    { field: "documento", headerName: "Documento", width: 150 },
    { field: "email", headerName: "Correo", width: 250 },
    { field: "telefono", headerName: "Teléfono", width: 150 },
    { field: "roles", headerName: "Roles", width: 200 }
  ];

  const actions = [
    {
      label: "Editar",
      icon: <EditIcon />,
      color: "info",
      onClick: handleEdit,
    },
    {
      label: "Eliminar",
      icon: <DeleteIcon />,
      color: "error",
      onClick: handleDelete,
    },
  ];

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="500" color="primary">
          Panel de Administración de Funcionarios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestión de funcionarios, administradores e instructores
        </Typography>
      </Box>

      <Box mb={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log("Agregar funcionario")}
        >
          Agregar Funcionario
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      <>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Listado de Extras</Typography>
            {loading && <CircularProgress size={24} />}
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" height="300px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Grid2 container spacing={2} marginTop={2}>
              <Grid2 size={12}>
                <DinamicTable
                  rows={rowsForTable}
                  columns={columns}
                  actions={actions}
                  pagination={{ page: 0, pageSize: 10 }}
                  enableCheckboxSelection={false}
                />
              </Grid2>
            </Grid2>

          )}
        </Paper>
      </>

    </>
  );
};

export default PanelAdmin;