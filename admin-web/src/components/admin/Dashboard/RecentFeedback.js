import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from "@mui/material";
import { Feedback as FeedbackIcon, Star as StarIcon } from "@mui/icons-material";
import { Grid } from "@mui/material";
import StyledCard from "../Common/StyledCard";

const API = "http://localhost:8000/api/v1";

export default function RecentFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const res = await fetch(`${API}/admin/feedback?limit=5`);
      const data = await res.json();

      console.log("FEEDBACK API RESPONSE:", data);

      // 🔒 ABSOLUTE SAFETY CHECK
      if (Array.isArray(data)) {
        setFeedback(data);
      } else if (Array.isArray(data?.data)) {
        setFeedback(data.data);
      } else {
        setFeedback([]);
      }
    } catch (error) {
      console.error("Failed to load feedback", error);
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid item xs={12} md={6}>
      <StyledCard>
        <Box sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Recent Feedback</Typography>
            <Button
              startIcon={<FeedbackIcon />}
              variant="outlined"
              size="small"
            >
              View All
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Phone</TableCell>
                  <TableCell align="center">Rating</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : feedback.length > 0 ? (
                  feedback.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.phone_number}</TableCell>

                      <TableCell align="center">
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              sx={{
                                fontSize: 16,
                                color:
                                  i < row.rating ? "#ffc107" : "#e0e0e0"
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {row.reason || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {row.created_at
                          ? new Date(row.created_at).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No feedback found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </StyledCard>
    </Grid>
  );
}
