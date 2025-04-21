import { Box, Typography, Paper } from "@mui/material";
import FuncionarioCard from "../shared/paper_funcionario";

const PanelPrincipal = () => {
  const id = localStorage.getItem("id");

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 3,
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 4,
          borderRadius: 4,
          backgroundColor: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderLeft: "6px solid #1976d2",
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom>
          Bienvenido, señor instructor 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Aquí podrá consultar su información y gestionar sus actividades.
        </Typography>
      </Paper>

      <FuncionarioCard 
      funcionarioId={id} 
      showTitle={false}
      maxWidth={"60vh"} />
    </Box>
  );
};

export default PanelPrincipal;
