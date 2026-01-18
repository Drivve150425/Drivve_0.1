// import React from "react";
// import { Paper, Box, Typography, Tabs, Tab } from "@mui/material";
// import {
//   Dashboard as DashboardIcon,
//   LocationCity as CityIcon,
//   Verified as VerifyIcon,
//   Settings as SettingsIcon,
//   LocalHospital as EmergencyIcon,
//   CardGiftcard as RewardsIcon,
//   Info as AboutIcon,
//   LocalOffer as OffersIcon,
//   Help as HelpIcon,
//   Notifications as NotificationIcon
// } from "@mui/icons-material";

// const adminTabs = [
//   { label: "Dashboard", value: "dashboard", icon: <DashboardIcon /> },
//   { label: "State & Cities", value: "cities", icon: <CityIcon /> },
//   { label: "Document Verification", value: "documents", icon: <VerifyIcon /> },
//   { label: "Matching Preferences", value: "preferences", icon: <SettingsIcon /> },
//   { label: "Emergency Contacts", value: "emergency", icon: <EmergencyIcon /> },
//   { label: "Rewards", value: "rewards", icon: <RewardsIcon /> },
//   { label: "About Us", value: "about", icon: <AboutIcon /> },
//   { label: "Promotions & Offers", value: "promotions", icon: <OffersIcon /> },
//   { label: "Help & Support", value: "support", icon: <HelpIcon /> },
//   { label: "Notifications", value: "notifications", icon: <NotificationIcon /> }
// ];

// export default function Sidebar({ activeTab, setActiveTab, admin }) {
//   // admin can be string or object
//   const adminName =
//     typeof admin === "string"
//       ? admin
//       : admin?.full_name || admin?.username || "Admin";

//   return (
//     <Paper
//       sx={{
//         width: 280,
//         minHeight: "100vh",
//         borderRadius: 0,
//         boxShadow: "4px 0 20px rgba(0,0,0,0.08)",
//         display: { xs: "none", md: "block" }
//       }}
//     >
//       <Box p={3}>
//         <Typography variant="h5" fontWeight="bold" color="primary">
//           Admin Panel
//         </Typography>

//         <Typography color="text.secondary" variant="body2">
//           Welcome back, <b>{adminName}</b>
//         </Typography>
//       </Box>

//       <Tabs
//         orientation="vertical"
//         value={activeTab}
//         onChange={(e, newValue) => setActiveTab(newValue)}
//         sx={{
//           "& .MuiTab-root": {
//             alignItems: "flex-start",
//             textAlign: "left",
//             py: 2,
//             minHeight: 56,
//             borderLeft: "4px solid transparent",
//             "&.Mui-selected": {
//               borderLeftColor: "primary.main",
//               bgcolor: "primary.10"
//             }
//           }
//         }}
//       >
//         {adminTabs.map((tab) => (
//           <Tab
//             key={tab.value}
//             value={tab.value}
//             icon={tab.icon}
//             iconPosition="start"
//             label={tab.label}
//             sx={{
//               justifyContent: "flex-start",
//               textTransform: "none"
//             }}
//           />
//         ))}
//       </Tabs>
//     </Paper>
//   );
// }
// import React from "react";
// import {
//   Paper,
//   Tabs,
//   Tab,
//   Box,
//   IconButton,
//   Tooltip
// } from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";
// import logoGray from "../sidebar/logogray.png";

// import {
//   Dashboard,
//   LocationCity,
//   Verified,
//   Settings,
//   LocalHospital,
//   CardGiftcard,
//   Info,
//   LocalOffer,
//   Help,
//   Notifications
// } from "@mui/icons-material";

// const adminTabs = [
//   { label: "Dashboard", value: "dashboard", icon: <Dashboard /> },
//   { label: "State & Cities", value: "cities", icon: <LocationCity /> },
//   { label: "Documents", value: "documents", icon: <Verified /> },
//   { label: "Preferences", value: "preferences", icon: <Settings /> },
//   { label: "Emergency", value: "emergency", icon: <LocalHospital /> },
//   { label: "Rewards", value: "rewards", icon: <CardGiftcard /> },
//   { label: "About Us", value: "about", icon: <Info /> },
//   { label: "Promotions", value: "promotions", icon: <LocalOffer /> },
//   { label: "Support", value: "support", icon: <Help /> },
//   { label: "Notifications", value: "notifications", icon: <Notifications /> }
// ];

// export default function Sidebar({
//   activeTab,
//   setActiveTab,
//   collapsed,
//   setCollapsed
// }) {
//   return (
//     <Paper
//       sx={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         height: "100vh",
//         width: collapsed ? 80 : 260,
//         transition: "width 0.3s",
//         borderRadius: 0,
//         zIndex: 1200
//       }}
//     >
//     <Box
//   sx={{
//     height: 64,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: collapsed ? "center" : "space-between",
//     px: 2
//   }}
// >
//   {!collapsed && (
//     <img
//       src={logoGray}
//       alt="Admin Logo"
//       style={{
//         height: 32,
//         objectFit: "contain",
//         cursor: "pointer"
//       }}
//       onClick={() => setActiveTab("dashboard")}
//     />
//   )}

//   <IconButton onClick={() => setCollapsed(!collapsed)}>
//     <MenuIcon />
//   </IconButton>
// </Box>


//       <Tabs
//         orientation="vertical"
//         value={activeTab}
//         onChange={(e, v) => setActiveTab(v)}
//       >
//         {adminTabs.map(tab => (
//           <Tooltip
//             key={tab.value}
//             title={collapsed ? tab.label : ""}
//             placement="right"
//           >
//             <Tab
//               value={tab.value}
//               icon={tab.icon}
//               iconPosition="start"
//               label={!collapsed && tab.label}
//               sx={{
//                 justifyContent: collapsed ? "center" : "flex-start",
//                 minHeight: 56,
//                 textTransform: "none",
//                 "&.Mui-selected": {
//                   borderLeft: "4px solid green",
//                   bgcolor: "#e8f5e9"
//                 }
//               }}
//             />
//           </Tooltip>
//         ))}
//       </Tabs>
//     </Paper>
//   );
// }
import React from "react";
import {
  Paper,
  Tabs,
  Tab,
  Box,
  IconButton,
  Tooltip
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import {
  Dashboard,
  LocationCity,
  Verified,
  Settings,
  LocalHospital,
  CardGiftcard,
  Info,
  LocalOffer,
  Help,
  Notifications
} from "@mui/icons-material";

import logoGray from "./logogray.png";

const adminTabs = [
  { label: "Dashboard", value: "dashboard", icon: <Dashboard /> },
  { label: "State & Cities", value: "cities", icon: <LocationCity /> },
  { label: "Documents", value: "documents", icon: <Verified /> },
  { label: "Preferences", value: "preferences", icon: <Settings /> },
  { label: "Emergency", value: "emergency", icon: <LocalHospital /> },
  { label: "Rewards", value: "rewards", icon: <CardGiftcard /> },
  { label: "About Us", value: "about", icon: <Info /> },
  { label: "Promotions", value: "promotions", icon: <LocalOffer /> },
  { label: "Support", value: "support", icon: <Help /> },
  { label: "Notifications", value: "notifications", icon: <Notifications /> }
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed
}) {
  return (
    <Paper
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: collapsed ? 80 : 260,
        transition: "width 0.3s",
        borderRadius: 0,
        zIndex: 1200,
        overflowX: "hidden"
      }}
    >
      {/* ===== LOGO + TOGGLE ===== */}
      <Box
        sx={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: 2
        }}
      >
        {!collapsed && (
          <img
            src={logoGray}
            alt="Admin Logo"
            style={{ height: 32, cursor: "pointer" }}
            onClick={() => setActiveTab("dashboard")}
          />
        )}

        <IconButton onClick={() => setCollapsed(!collapsed)}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* ===== MENU ===== */}
      <Tabs
        orientation="vertical"
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        TabIndicatorProps={{ style: { display: "none" } }}
      >
        {adminTabs.map(tab => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={
              collapsed ? (
                <Tooltip title={tab.label} placement="right">
                  <Box>{tab.icon}</Box>
                </Tooltip>
              ) : (
                tab.icon
              )
            }
            iconPosition="start"
            label={!collapsed && tab.label}
            sx={{
              minHeight: 56,
              justifyContent: collapsed ? "center" : "flex-start",
              textTransform: "none",
              borderLeft: "4px solid transparent",
              color: "text.secondary",

              "&.Mui-selected": {
                borderLeftColor: "primary.main",
                bgcolor: "rgba(25,118,210,0.08)",
                color: "primary.main",
                "& svg": { color: "primary.main" }
              }
            }}
          />
        ))}
      </Tabs>
    </Paper>
  );
}
