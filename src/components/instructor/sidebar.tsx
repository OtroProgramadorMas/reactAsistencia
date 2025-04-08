import React from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Divider
} from "@mui/material";

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
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        <ListItemButton onClick={() => onSelect("principal")}>
          <ListItemText primary="Principal" />
        </ListItemButton>
        <Divider />
        {dynamicOptions.map((opt) => (
          <ListItemButton key={opt.id} onClick={() => onSelect("fichas", opt.id)}>
            <ListItemText primary={opt.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;