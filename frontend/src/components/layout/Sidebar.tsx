import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Chat, Search, Settings, Person, Add } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { text: "Chats", icon: <Chat />, path: "/chat" },
    { text: "Search", icon: <Search />, path: "/search" },
    { text: "Profile", icon: <Person />, path: "/profile" },
    { text: "Settings", icon: <Settings />, path: "/settings" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleCreateChat = () => {
    // TODO: Implement create chat modal
    console.log("Create new chat");
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: "block", sm: "none" },
        "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Menu
        </Typography>
      </Box>
      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Tooltip title="Create new chat">
          <IconButton
            onClick={handleCreateChat}
            color="primary"
            sx={{ width: "100%" }}
          >
            <Add />
            <Typography variant="body2" sx={{ ml: 1 }}>
              New Chat
            </Typography>
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
