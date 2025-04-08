import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Avatar, CircularProgress, Alert } from "@mui/material";

export interface FuncionarioConRol {
  idFuncionario: number | null;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  url_imgFuncionario: string | null;
  id_tipoDocumento: number;
  rol: string;
}

const FuncionarioCard = () => {
  const [user, setUser] = useState<FuncionarioConRol | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const idFuncionario = localStorage.getItem("id");
  
        if (!token || !idFuncionario) {
          throw new Error("No hay información de autenticación.");
        }
  
        const response = await fetch(`http://localhost:8000/funcionarios/${idFuncionario}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        if (!response.ok) {
          throw new Error("Error al obtener los datos del funcionario");
        }
  
        const data = await response.json();
        setUser(data.funcionario); // Ajuste aquí
  
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user) return <Alert severity="warning">No se encontró información del funcionario</Alert>;

  return (
    <Card sx={{ maxWidth: 300, p: 2, m: 2, boxShadow: 3 }}>
      <CardContent>
        <Avatar src={user.url_imgFuncionario || undefined} sx={{ width: 80, height: 80, mb: 2 }} />
        <Typography variant="h6">{user.nombres} {user.apellidos}</Typography>
        <Typography variant="body2" color="text.secondary">📧 {user.email}</Typography>
        <Typography variant="body2" color="text.secondary">📞 {user.telefono}</Typography>
        <Typography variant="body2" color="text.secondary">🛡️ Rol: {user.rol}</Typography>
      </CardContent>
    </Card>
  );
};

export default FuncionarioCard;
