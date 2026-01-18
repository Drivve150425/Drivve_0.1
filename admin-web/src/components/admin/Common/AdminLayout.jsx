import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "../sidebar";
import Header from "../Header";

export default function AdminLayout({
  children,
  admin,
  activeTab,
  setActiveTab
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* RIGHT SIDE */}
      <Box
        sx={{
          flexGrow: 1,
          ml: collapsed ? "80px" : "260px",
          transition: "margin 0.3s",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* HEADER */}
        <Header admin={admin} />

        {/* SCROLLABLE CONTENT */}
        <Box
          sx={{
            flexGrow: 1,
            mt: "64px",
            overflowY: "auto",
            p: 3,
            bgcolor: "#f9fafb"
          }}
        >
          {children}
        </Box>

        {/* FOOTER */}
        <Box
          sx={{
            height: 80,
            borderTop: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight:400
          }}
        >
          Copyright © 2026 Drivve
        </Box>
      </Box>
    </Box>
  );
}
