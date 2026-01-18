import React from "react";
import { Grid, Box, Typography, Button } from "@mui/material";
import StyledCard from "../Common/StyledCard";
import {
  LocationCity as CityIcon,
  Flag as StateIcon,
  Verified as VerifyIcon,
  Settings as SettingsIcon,
  LocalHospital as EmergencyIcon,
  CardGiftcard as RewardsIcon
} from "@mui/icons-material";

const quickActions = [
  { label: "State & City", value: "cities", icon: <CityIcon />, color: "primary" },
  //{ label: "Add State", value: "states", icon: <StateIcon />, color: "primary" },
  { label: "Verify Documents", value: "documents", icon: <VerifyIcon />, color: "secondary" },
  { label: "Update Preferences", value: "preferences", icon: <SettingsIcon />, color: "success" },
  { label: "Emergency Contacts", value: "emergency", icon: <EmergencyIcon />, color: "warning" },
  { label: "Manage Rewards", value: "rewards", icon: <RewardsIcon />, color: "info" }
];

export default function QuickActions({ setActiveTab }) {
  return (
    <Grid container spacing={3} mt={3}>
      <Grid item xs={12}>
        <StyledCard>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid item xs={6} sm={4} md={2} key={action.value}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color={action.color}
                    startIcon={action.icon}
                    onClick={() => setActiveTab(action.value)}
                    sx={{
                      py: 2,
                      borderRadius: 2,
                      textTransform: "none"
                    }}
                  >
                    {action.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        </StyledCard>
      </Grid>
    </Grid>
  );
}