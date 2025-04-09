import React, { useState } from "react";
import { Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DinamicTable from "../../shared/dataTable";

const initialAdmins = [
  { id: 1, nombre: "Juan Pérez", email: "juan@mail.com", rol: "Superadmin" },
  { id: 2, nombre: "Laura Gómez", email: "laura@mail.com", rol: "Editor" },
];

const AdminPanel: React.FC = () => {
  const [admins, setAdmins] = useState(initialAdmins);

  const handleAddAdmin = () => {
    const newAdmin = {
      id: admins.length + 1,
      nombre: "Nuevo Admin",
      email: `nuevo${admins.length + 1}@mail.com`,
      rol: "Editor"
    };
    setAdmins([...admins, newAdmin]);
  };

  const handleEdit = (row: any) => {
    alert(`Editar admin: ${row.nombre}`);
  };

  const handleDelete = (row: any) => {
    setAdmins(admins.filter((admin) => admin.id !== row.id));
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "nombre", headerName: "Nombre", width: 200 },
    { field: "email", headerName: "Email", width: 250 },
    { field: "rol", headerName: "Rol", width: 150 },
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
    <Stack spacing={2}>
      <Typography variant="h5" component="h2">
        Panel de Administradores
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddAdmin}
        sx={{ alignSelf: "flex-end" }}
      >
        Agregar Administrador
      </Button>

      <DinamicTable rows={admins} columns={columns} actions={actions} />
    </Stack>
  );
};

export default AdminPanel;
