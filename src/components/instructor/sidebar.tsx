import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import {
  Home as HomeIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";

type Option = { id: string; label: string };

type SidebarProps = {
  dynamicOptions: Option[];
  onSelect: (component: "principal" | "fichas", value?: string) => void;
};

const drawerWidth = 240;

const Sidebar = ({ dynamicOptions, onSelect }: SidebarProps) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#f9f9f9",
          borderRight: "1px solid #ddd",
        },
      }}
    >
      <Toolbar />
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Navegación
        </Typography>
        <List disablePadding>
          <ListItemButton onClick={() => onSelect("principal")} sx={{ borderRadius: 1 }}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Principal" />
          </ListItemButton>
        </List>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Fichas
        </Typography>
        <List disablePadding>
          {dynamicOptions.map((opt) => (
            <ListItemButton
              key={opt.id}
              onClick={() => onSelect("fichas", opt.id)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary={opt.label} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
