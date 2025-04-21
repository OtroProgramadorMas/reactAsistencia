import * as React from 'react';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Paper, IconButton, Tooltip } from '@mui/material';
import { esES } from '@mui/x-data-grid/locales';

interface ActionButton {
    label: string;
    icon: React.ReactNode;
    color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
    onClick: (row: unknown) => void;
}

interface DinamicTableProps {
    rows: unknown[];
    columns: GridColDef[];
    actions?: ActionButton[]; // Múltiples botones personalizados
    pagination?: { page: number; pageSize: number };
    height?: number | string; // Altura personalizable
    width?: number | string;  // Ancho personalizable
    enableCheckboxSelection?: boolean; // Opción para habilitar/deshabilitar checkbox selection
}

const DinamicTable: React.FC<DinamicTableProps> = ({
    rows,
    columns,
    actions = [], // Por defecto, no hay acciones
    pagination = { page: 0, pageSize: 8 },
    height = 600, // Altura por defecto
    width = "100vh", // Ancho por defecto
    enableCheckboxSelection = true // Habilitado por defecto
}) => {

    const columnasFinales = actions.length > 0
        ? [
            ...columns,
            {
                field: "actions",
                headerName: "Acciones",
                width: actions.length * 50, // Ajusta el ancho dinámicamente
                renderCell: (params: GridRenderCellParams) => (
                    <>
                        {actions.map((action, index) => (
                            <Tooltip key={index} title={action.label}>
                                <IconButton color={action.color || "primary"} onClick={() => action.onClick(params.row)}>
                                    {action.icon}
                                </IconButton>
                            </Tooltip>
                        ))}
                    </>
                ),
            }
        ]
        : columns;

    return (
        <Paper sx={{ 
            height: height, 
            width: width,
            overflow: 'auto' }}>
            <DataGrid
                sx={{border: 0}}
                rows={rows}
                columns={columnasFinales}
                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                initialState={{ pagination: { paginationModel: pagination } }}
                pageSizeOptions={[5, 8, 10, 50, 100]}
                checkboxSelection={enableCheckboxSelection}
                disableRowSelectionOnClick
            />
        </Paper>
    );
}

export default DinamicTable;