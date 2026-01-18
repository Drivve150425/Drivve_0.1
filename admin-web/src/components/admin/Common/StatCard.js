import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import StyledCard from "./StyledCard";

export default function StatCard({ title, value, change, icon, color }) {
  return (
    <StyledCard>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {change > 0 ? (
                  <TrendingUp sx={{ color: "#4caf50", fontSize: 16 }} />
                ) : (
                  <TrendingDown sx={{ color: "#f44336", fontSize: 16 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: change > 0 ? "#4caf50" : "#f44336",
                    ml: 0.5
                  }}
                >
                  {Math.abs(change)}% from last week
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </Box>
    </StyledCard>
  );
}