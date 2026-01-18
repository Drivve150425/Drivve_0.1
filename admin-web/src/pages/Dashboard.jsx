import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  LocationCity,
  Map,
  VerifiedUser,
  Settings,
  Call,
  CardGiftcard,
  LocalOffer,
  Help,
  Info,
  Feedback,
} from "@mui/icons-material";
import { Outlet, useNavigate } from "react-router-dom";

const drawerWidth = 260;

export default function Dashboard() {
  const navigate = useNavigate();
  const admin = localStorage.getItem("admin");

  const menu = [
    { text: "Home", icon: <DashboardIcon />, path: "/admin" },
    { text: "Cities", icon: <LocationCity />, path: "/admin/cities" },
    { text: "States", icon: <Map />, path: "/admin/states" },
    { text: "Documents", icon: <VerifiedUser />, path: "/admin/documents" },
    { text: "Matching", icon: <Settings />, path: "/admin/matching" },
    { text: "Emergency", icon: <Call />, path: "/admin/emergency" },
    { text: "Rewards", icon: <CardGiftcard />, path: "/admin/rewards" },
    { text: "Promotions", icon: <LocalOffer />, path: "/admin/promotions" },
    { text: "Help", icon: <Help />, path: "/admin/help" },
    { text: "About Us", icon: <Info />, path: "/admin/about" },
    { text: "Feedback", icon: <Feedback />, path: "/admin/feedback" },
  ];

  return (
    <Box display="flex">
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            bgcolor: "#0f2027",
            color: "#fff",
          },
        }}
      >
        <Box p={3}>
          <Typography variant="h6">Admin Panel</Typography>
          <Typography variant="caption">Welcome, {admin}</Typography>
        </Box>

        <List>
          {menu.map((m) => (
            <ListItemButton key={m.text} onClick={() => navigate(m.path)}>
              <ListItemIcon sx={{ color: "white" }}>{m.icon}</ListItemIcon>
              <ListItemText primary={m.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box flex={1} p={4} bgcolor="#f4f6f8" minHeight="100vh">
        <Outlet />
      </Box>
    </Box>
  );
}
