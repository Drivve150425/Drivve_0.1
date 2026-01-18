import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
  Divider
} from "@mui/material";

import {
  Description,
  PendingActions,
  CheckCircle,
  Cancel,
  EventBusy,
  People,
  PersonOutline,
  Block,
  DirectionsCar
} from "@mui/icons-material";

const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://192.168.1.13:8000/api/v1"
    : "https://your-api-domain.com/api/v1";

export default function AdminDashboard({ adminUsername = "Admin" }) {
  const [userStats, setUserStats] = useState(null);
  const [docStats, setDocStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [snackbar, setSnackbar] = useState(null);

  /* ================= LOAD DATA ================= */
  const loadDashboard = async () => {
    try {
      // ✅ USER STATS ONLY
      const userStatsRes = await fetch(
        `${API_BASE_URL}/admin/documen/stats`
      );

      // ✅ DOCUMENT STATS (OLD / PREVIOUS)
      const docStatsRes = await fetch(
        `${API_BASE_URL}/documents/stats`
      );

      // ✅ DOCUMENT LIST
      const docsRes = await fetch(
        `${API_BASE_URL}/admin/documents?status=pending&page=1&limit=10`
      );

      const userStatsData = await userStatsRes.json();
      const docStatsData = await docStatsRes.json();
      const docsData = await docsRes.json();

      setUserStats(userStatsData.stats);
      setDocStats(docStatsData.stats);
      setDocuments(docsData.documents || []);
    } catch {
      setSnackbar({ type: "error", msg: "Failed to load dashboard" });
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ================= ACTIONS ================= */
  const approve = async () => {
    await fetch(`${API_BASE_URL}/admin/documents/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_id: selected.id,
        status: "approved",
        admin_username: adminUsername
      })
    });

    setSnackbar({ type: "success", msg: "Document approved" });
    setSelected(null);
    loadDashboard();
  };

  const reject = async () => {
    if (!rejectReason.trim()) return;

    await fetch(`${API_BASE_URL}/admin/documents/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_id: selected.id,
        status: "rejected",
        rejection_reason: rejectReason,
        admin_username: adminUsername
      })
    });

    setSnackbar({ type: "success", msg: "Document rejected" });
    setRejectReason("");
    setSelected(null);
    loadDashboard();
  };

  if (!userStats || !docStats) {
    return <Typography>Loading dashboard…</Typography>;
  }

  /* ================= UI ================= */
  return (
    <Box sx={{ maxWidth: 1400, mx: "auto" }}>

      {/* ================= DOCUMENT STATS ================= */}
      <Typography variant="h6" mb={2}>
        Document Statistics
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)"
          },
          gap: 3,
          mb: 5
        }}
      >
        <Stat title="Total Documents" value={docStats.total_documents} icon={<Description />} color="#1976d2" />
        <Stat title="Pending" value={docStats.pending} icon={<PendingActions />} color="#ed6c02" />
        <Stat title="Approved" value={docStats.approved} icon={<CheckCircle />} color="#2e7d32" />
        <Stat title="Rejected" value={docStats.rejected} icon={<Cancel />} color="#d32f2f" />
        <Stat title="Expired" value={docStats.expired} icon={<EventBusy />} color="#6a1b9a" />
      </Box>

      {/* ================= USER & RIDE STATS ================= */}
      <Typography variant="h6" mb={2}>
        User & Ride Statistics
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)"
          },
          gap: 3,
          mb: 5
        }}
      >
        <Stat title="Total Users" value={userStats.total_users} icon={<People />} color="#1565c0" />
        <Stat title="Active Users" value={userStats.active_users} icon={<PersonOutline />} color="#2e7d32" />
        <Stat title="Suspended Users" value={userStats.suspended_users} icon={<Block />} color="#d32f2f" />
        <Stat title="Daily Rides" value={userStats.daily_rides} icon={<DirectionsCar />} color="#6a1b9a" />
      </Box>

      {/* ================= DOCUMENT LIST ================= */}
      <Typography variant="h6" mb={2} mt={4}>
        Pending Document Verification
      </Typography>

      {documents.length === 0 && (
        <Typography color="text.secondary">
          No pending documents 🎉
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)"
          },
          gap: 3
        }}
      >
        {documents.map(doc => (
          <Paper
            key={doc.id}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
              transition: "0.3s",
              "&:hover": { transform: "translateY(-4px)" }
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography fontWeight={600}>
                  {doc.document_type.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doc.user_name} • {doc.phone_number}
                </Typography>
              </Box>
              <Chip label="Pending" color="warning" />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Button
              fullWidth
              variant="contained"
              onClick={() => setSelected(doc)}
            >
              Review Document
            </Button>
          </Paper>
        ))}
      </Box>

      {/* ================= REVIEW MODAL ================= */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>Document Review</DialogTitle>

        <DialogContent>
          {selected && (
            <>
              <Typography><b>User:</b> {selected.user_name}</Typography>
              <Typography><b>Phone:</b> {selected.phone_number}</Typography>
              <Typography><b>Document:</b> {selected.document_type}</Typography>

              <Stack direction="row" spacing={2} mt={3}>
                <Preview src={selected.front_image_url} />
                {selected.back_image_url && <Preview src={selected.back_image_url} />}
                <Preview src={selected.selfie_image_url} />
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={3}
                sx={{ mt: 3 }}
                placeholder="Rejection reason (required if rejecting)"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelected(null)}>Cancel</Button>
          <Button color="error" onClick={reject}>Reject</Button>
          <Button variant="contained" onClick={approve}>Approve</Button>
        </DialogActions>
      </Dialog>

      {/* ================= SNACKBAR ================= */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
      >
        <Alert severity={snackbar?.type}>
          {snackbar?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* ================= SMALL COMPONENTS ================= */

function Stat({ title, value, icon, color }) {
  return (
    <Paper
      sx={{
        p: 3,
        minHeight: 140,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: `linear-gradient(135deg, ${color}15, ${color}30)`,
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
      }}
    >
      <Box sx={{ color, mb: 1 }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>
    </Paper>
  );
}

function Preview({ src }) {
  return (
    <Box
      component="img"
      src={src}
      alt="doc"
      sx={{
        width: 140,
        height: 90,
        objectFit: "cover",
        borderRadius: 2,
        border: "1px solid #ddd"
      }}
    />
  );
}
