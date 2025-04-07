import React, { useEffect, useState } from "react";
import DinamicTable from "../shared/dataTable";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

// Definimos el tipo del programa
interface Programa {
  idprograma: number;
  codigo_programa: string;
  nombre_programa: string;
  id?: number;
}

const ProgramasPanel: React.FC = () => {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [nuevoPrograma, setNuevoPrograma] = useState({
    codigo_programa: "",
    nombre_programa: "",
  });

  const fetchProgramas = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/programas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Respuesta del servidor:", data);

      if (
        data.success &&
        data.programas?.success &&
        Array.isArray(data.programas.data)
      ) {
        const dataConIds = data.programas.data.map((p: Programa) => ({
          ...p,
          id: p.idprograma,
        }));
        setProgramas(dataConIds);
      } else {
        setMensaje("No se pudieron cargar los programas.");
      }
    } catch (err) {
      console.error("Error en fetchProgramas:", err);
      setMensaje("Error al conectar con el servidor.");
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setNuevoPrograma({ codigo_programa: "", nombre_programa: "" });
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoPrograma({
      ...nuevoPrograma,
      [e.target.name]: e.target.value,
    });
  };


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  const handleGuardarPrograma = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8000/programas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoPrograma),
      });

      const result = await res.json();
      if (result.success) {
        fetchProgramas(); // recarga tabla
        handleCloseDialog(); // cierra formulario
      } else {
        alert("Error al guardar el programa");
      }
    } catch (err) {
      console.error("Error al guardar programa:", err);
      alert("Error al conectar con el servidor.");
    }
  };

  useEffect(() => {
    fetchProgramas();
  }, []);

  const columns: GridColDef[] = [
    { field: "idprograma", headerName: "ID", width: 100 },
    { field: "codigo_programa", headerName: "Código", width: 150 },
    { field: "nombre_programa", headerName: "Nombre", width: 300 },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Programas registrados</Typography>
        <Button variant="contained" onClick={handleOpenDialog}>
          Agregar programa
        </Button>
      </Box>

      {mensaje && (
        <Typography color="error" mb={2}>
          {mensaje}
        </Typography>
      )}

      <DinamicTable
        rows={programas}
        columns={columns}
        pagination={{ page: 0, pageSize: 8 }}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Agregar nuevo programa</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Código del programa"
            name="codigo_programa"
            fullWidth
            value={nuevoPrograma.codigo_programa}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Nombre del programa"
            name="nombre_programa"
            fullWidth
            value={nuevoPrograma.nombre_programa}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleGuardarPrograma} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProgramasPanel;



/*import React, { useEffect, useState } from "react";
import DinamicTable from "../shared/dataTable";
import { Box, Typography } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";

// Definimos el tipo del programa
interface Programa {
  idprograma: number;
  codigo_programa: number;
  nombre_programa: string;
  id?: number; // requerido por MUI DataGrid
}

const ProgramasPanel: React.FC = () => {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [mensaje, setMensaje] = useState("");

  const fetchProgramas = async () => {
    const token = localStorage.getItem("token");
  
    try {
      const res = await fetch("http://localhost:8000/programas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      console.log("Respuesta del servidor:", data); // 👈 para depurar
  
      // Verificamos si la estructura es la esperada
      if (data.success && data.programas?.success && Array.isArray(data.programas.data)) {
        const dataConIds = data.programas.data.map((p: Programa) => ({
          ...p,
          id: p.idprograma, // requerido por MUI DataGrid
        }));
        setProgramas(dataConIds);
      } else {
        setMensaje("No se pudieron cargar los programas.");
      }
    } catch (err) {
      console.error("Error en fetchProgramas:", err);
      setMensaje("Error al conectar con el servidor.");
    }
  };
  

  useEffect(() => {
    fetchProgramas();
  }, []);

  const columns: GridColDef[] = [
    { field: "idprograma", headerName: "ID", width: 100 },
    { field: "codigo_programa", headerName: "Código", width: 150 },
    { field: "nombre_programa", headerName: "Nombre", width: 300 },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Programas registrados
      </Typography>

      {mensaje && (
        <Typography color="error" mb={2}>
          {mensaje}
        </Typography>
      )}

      <DinamicTable
        rows={programas}
        columns={columns}
        pagination={{ page: 0, pageSize: 8 }}
      />
    </Box>
  );
};

export default ProgramasPanel;
*/