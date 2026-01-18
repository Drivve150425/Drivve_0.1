// import React from "react";
// import { Paper, Box, Typography, Tabs, Tab, IconButton } from "@mui/material";
// import { MoreVert } from "@mui/icons-material";

// const adminTabs = [
//   { label: "Dashboard", value: "dashboard" },
//   { label: "Cities", value: "cities" },
//   { label: "States", value: "states" },
//   { label: "Documents", value: "documents" },
//   { label: "Preferences", value: "preferences" },
//   { label: "Emergency", value: "emergency" },
//   { label: "Rewards", value: "rewards" },
//   { label: "About", value: "about" },
//   { label: "Promotions", value: "promotions" },
//   { label: "Support", value: "support" }
// ];

// export default function Header({ activeTab, setActiveTab, admin }) {
//   return (
//     <Paper
//       sx={{
//         p: 2,
//         mb: 3,
//         display: { xs: "block", md: "none" },
//         borderRadius: 2
//       }}
//     >
//       <Box display="flex" alignItems="center" justifyContent="space-between">
//         <Typography variant="h6">Admin Dashboard</Typography>
//         <IconButton>
//           <MoreVert />
//         </IconButton>
//       </Box>
      
//       <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
//         <Tabs
//           value={activeTab}
//           onChange={(e, newValue) => setActiveTab(newValue)}
//           variant="scrollable"
//           scrollButtons="auto"
//         >
//           {adminTabs.map((tab) => (
//             <Tab
//               key={tab.value}
//               value={tab.value}
//               label={tab.label}
//               sx={{ minHeight: 48 }}
//             />
//           ))}
//         </Tabs>
//       </Box>
//     </Paper>
//   );
// }
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography
} from "@mui/material";

export default function Header({ admin }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const name =
    typeof admin === "string"
      ? admin
      : admin?.full_name || admin?.username || "Admin";

  return (
    <AppBar position="fixed" color="inherit" elevation={1}>
      <Toolbar sx={{ justifyContent: "flex-end" }}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <Avatar />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem disabled>
            <Typography fontWeight="bold">{name}</Typography>
          </MenuItem>
          <MenuItem onClick={() => alert("Logout")}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
