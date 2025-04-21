// components/shared/Sidebar.tsx
import { Drawer, List, ListItem, ListItemButton, Toolbar, Tooltip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import ApartmentIcon from "@mui/icons-material/Apartment";

interface SidebarProps {
  onSelect: (option: string) => void;
}

const Sidebar = ({ onSelect }: SidebarProps) => {
  const menuItems = [
    { label: "Principal", icon: <HomeIcon /> },
    { label: "Funcionario", icon: <PersonIcon /> },
    { label: "Organizacion", icon: <ApartmentIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 80,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 80,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ justifyContent: "center" }}>
            <Tooltip title={item.label} placement="right">
              <ListItemButton
                onClick={() => onSelect(item.label)}
                sx={{ justifyContent: "center", minHeight: 60 }}
              >
                {item.icon}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
