import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";

const Dashboard = () => {
  const data = [
    { label: "Usuarios", value: 134, icon: <PeopleIcon fontSize="large" />, color: "#1976d2" },
    { label: "Reportes", value: 28, icon: <AssignmentIcon fontSize="large" />, color: "#2e7d32" },
    { label: "Último ingreso", value: "11:30 AM", icon: <AccessTimeIcon fontSize="large" />, color: "#ed6c02" },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Control
      </Typography>
      <Grid container spacing={3}>
        {data.map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderLeft: `6px solid ${item.color}`,
              }}
            >
              <Box sx={{ color: item.color }}>{item.icon}</Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="h6">{item.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
