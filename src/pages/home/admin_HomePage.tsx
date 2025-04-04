import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import Navbar from "../../components/shared/navbar";

const RegistroUsuarios = () => {
  const [open, setOpen] = useState<string | null>(null);

  const handleOpen = (tipo: string) => {
    setOpen(tipo);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  return (
    <>
      <Navbar userType="aprendiz" userName={userData.nombre} />
      <Container maxWidth="md" sx={{ textAlign: "center", my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          ¡Bienvenido!
        </Typography>
        <Typography variant="body1" paragraph>
          Selecciona el tipo de usuario que deseas registrar.
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            onClick={() => handleOpen("Administrativo")}
          >
            Registrar Administrativo
          </Button>
          <Button variant="contained" onClick={() => handleOpen("Instructor")}>
            Registrar Instructor
          </Button>
          <Button variant="contained" onClick={() => handleOpen("Aprendiz")}>
            Registrar Aprendiz
          </Button>
        </Box>

        {open && (
          <Dialog open={true} onClose={handleClose}>
            <DialogTitle>Registro de {open}</DialogTitle>
            <DialogContent>
              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
              >
                <TextField label="Nombre" variant="outlined" fullWidth />
                <TextField
                  label="Correo"
                  type="email"
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  fullWidth
                />
                <Button variant="contained" color="primary" type="submit">
                  Registrar
                </Button>
              </Box>
            </DialogContent>
          </Dialog>
        )}
      </Container>
    </>
  );
};

export default RegistroUsuarios;
