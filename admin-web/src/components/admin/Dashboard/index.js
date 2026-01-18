import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import AdminLayout from "../Common/AdminLayout";

import DashboardStats from "./DashboardStats";
// import ChartsSection from "./ChartsSection";
import RecentFeedback from "./RecentFeedback";
import QuickActions from "./QuickActions";

import Cities from "../Cities";
import Documents from "../Documents";
import Preferences from "../Preferences";
import Emergency from "../Emergency";
import Rewards from "../Rewards";
import AboutUs from "../AboutUs";
import Promotions from "../Promotions";
import HelpSupport from "../HelpSupport";
import Notification from "../Notification";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const admin = JSON.parse(localStorage.getItem("admin"));

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <DashboardStats />
            {/* <ChartsSection /> */}
            <RecentFeedback />
            <QuickActions setActiveTab={setActiveTab} />
          </>
        );
      case "cities":
        return <Cities />;
      case "documents":
        return <Documents />;
      case "preferences":
        return <Preferences />;
      case "emergency":
        return <Emergency />;
      case "rewards":
        return <Rewards />;
      case "about":
        return <AboutUs />;
      case "promotions":
        return <Promotions />;
      case "support":
        return <HelpSupport />;
      case "notifications":
        return <Notification />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <AdminLayout
      admin={admin}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {activeTab === "dashboard" && (
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold">
            Dashboard Overview
          </Typography>
          <Typography color="text.secondary">
            Welcome to your admin dashboard
          </Typography>
        </Box>
      )}

      {renderTabContent()}
    </AdminLayout>
  );
}
