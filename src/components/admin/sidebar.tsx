// components/shared/Sidebar.tsx
import { Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar } from "@mui/material";

interface SidebarProps {
  onSelect: (option: string) => void;
}

const Sidebar = ({ onSelect }: SidebarProps) => {
  const menuItems = ["Principal","Instructor", "Administrador", "Programa"];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={() => onSelect(text)}>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
