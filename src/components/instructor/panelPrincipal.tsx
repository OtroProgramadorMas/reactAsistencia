import { Box, Typography, Paper } from "@mui/material";
import FuncionarioCard from "../shared/paper_funcionario";

const PanelPrincipal = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 3,
      p: 3,
    }}
  >
    <Paper
      elevation={3}
      sx={{
        padding: 4,
        borderRadius: 3,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography variant="h4" component="h2" gutterBottom>
        Bienvenido, señor instructor 👋
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Aquí podrá consultar su información y gestionar sus actividades.
      </Typography>
    </Paper>

    <FuncionarioCard />

  </Box>
);

export default PanelPrincipal;
