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
    actions?: ActionButton[]; // Ahora puedes pasar múltiples botones personalizados
    pagination?: { page: number; pageSize: number };
}

const DinamicTable: React.FC<DinamicTableProps> = ({
    rows,
    columns,
    actions = [], // Por defecto, no hay acciones
    pagination = { page: 0, pageSize: 8 }
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
        <Paper sx={{ height: 600, width: "100%" }} role="region" aria-label="tabla dinamica">
            <DataGrid
                rows={rows}
                columns={columnasFinales}
                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                initialState={{ pagination: { paginationModel: pagination } }}
                pageSizeOptions={[5, 8, 10, 50, 100]}
                checkboxSelection
                disableRowSelectionOnClick
                sx={{ border: 0 }}
            />
        </Paper>
    );
}

export default DinamicTable;
