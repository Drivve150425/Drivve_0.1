// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Chip,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Stack,
//   Snackbar,
//   Alert,
//   InputAdornment,
//   Tabs,
//   Tab,
//   Grid,
//   Button
// } from "@mui/material";
// import { ExpandMore, Search } from "@mui/icons-material";

// const API_BASE_URL =
//   process.env.NODE_ENV === "development"
//     ? "http://192.168.1.13:8000/api/v1"
//     : "https://your-api-domain.com/api/v1";

// export default function AdminDocuments({ adminUsername = "Admin" }) {
//   /* ================= STATE ================= */
//   const [documents, setDocuments] = useState([]);
//   const [status, setStatus] = useState("pending");
//   const [search, setSearch] = useState("");

//   const [selected, setSelected] = useState(null);
//   const [tab, setTab] = useState(0);

//   const [rejectOpen, setRejectOpen] = useState(false);
//   const [rejectReason, setRejectReason] = useState("");

//   const [history, setHistory] = useState([]);
//   const [loadingHistory, setLoadingHistory] = useState(false);

//   const [imageModal, setImageModal] = useState({
//     open: false,
//     url: "",
//     title: ""
//   });

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success"
//   });

//   /* ================= LOAD DOCUMENTS ================= */
//   const loadDocuments = async () => {
//     try {
//       const res = await fetch(
//         `${API_BASE_URL}/admin/documents?status=${status}&page=1&limit=50`
//       );
//       const data = await res.json();
//       setDocuments(data.documents || []);
//     } catch {
//       setSnackbar({
//         open: true,
//         message: "Failed to load documents",
//         severity: "error"
//       });
//     }
//   };

//   useEffect(() => {
//     loadDocuments();
//   }, [status]);

//   /* ================= LOAD HISTORY ================= */
//   const loadHistory = async (documentId) => {
//     try {
//       setLoadingHistory(true);
//       const res = await fetch(
//         `${API_BASE_URL}/admin/documents/${documentId}/history`
//       );
//       const data = await res.json();
//       setHistory(data || []);
//     } catch {
//       setHistory([]);
//     } finally {
//       setLoadingHistory(false);
//     }
//   };

//   /* ================= FILTER ================= */
//   const filteredDocuments = useMemo(() => {
//     return documents.filter(d =>
//       d.document_number?.toLowerCase().includes(search.toLowerCase()) ||
//       d.user_name?.toLowerCase().includes(search.toLowerCase()) ||
//       d.phone_number?.includes(search)
//     );
//   }, [documents, search]);

//   /* ================= ACTIONS ================= */
//   const approveDocument = async () => {
//     if (!selected) return;

//     try {
//       await fetch(`${API_BASE_URL}/documents/status`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           document_id: selected.id,
//           status: "approved",
//           admin_username: adminUsername
//         })
//       });

//       setSnackbar({ open: true, message: "Document approved", severity: "success" });
//       setSelected(null);
//       loadDocuments();
//     } catch {
//       setSnackbar({ open: true, message: "Approval failed", severity: "error" });
//     }
//   };

//   const rejectDocument = async () => {
//     if (!selected || !rejectReason.trim()) return;

//     try {
//       await fetch(`${API_BASE_URL}/documents/status`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           document_id: selected.id,
//           status: "rejected",
//           rejection_reason: rejectReason,
//           admin_username: adminUsername
//         })
//       });

//       setSnackbar({ open: true, message: "Document rejected", severity: "success" });
//       setRejectOpen(false);
//       setRejectReason("");
//       setSelected(null);
//       setTab(0);
//       loadDocuments();
//     } catch {
//       setSnackbar({ open: true, message: "Rejection failed", severity: "error" });
//     }
//   };

//   const formatDate = (d) => (d ? new Date(d).toLocaleString() : "—");

//   /* ================= RENDER ================= */
//   return (
//     <Box p={3}>
//       <Typography variant="h5" mb={2}>
//         Document Verification (Admin)
//       </Typography>

//       {/* STATUS TABS */}
//       <Tabs value={status} onChange={(e, v) => setStatus(v)} sx={{ mb: 2 }}>
//         <Tab value="pending" label="Pending" />
//         <Tab value="approved" label="Approved" />
//         <Tab value="rejected" label="Rejected" />
//         <Tab value="all" label="All" />
//       </Tabs>

//       {/* SEARCH */}
//       <TextField
//         fullWidth
//         placeholder="Search by name, phone, document number"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         InputProps={{
//           startAdornment: (
//             <InputAdornment position="start">
//               <Search />
//             </InputAdornment>
//           )
//         }}
//         sx={{ mb: 3 }}
//       />

//       {/* DOCUMENT LIST */}
//       {filteredDocuments.map(doc => (
//         <Accordion key={doc.id} sx={{ mb: 1 }}>
//           <AccordionSummary
//             expandIcon={<ExpandMore />}
//             onClick={() => {
//               setSelected(doc);
//               setTab(0);
//               loadHistory(doc.id);
//             }}
//           >
//             <Box display="flex" justifyContent="space-between" width="100%">
//               <Typography>
//                 {doc.document_type} — {doc.document_number}
//               </Typography>
//               <Chip label={doc.status} />
//             </Box>
//           </AccordionSummary>
//           <AccordionDetails />
//         </Accordion>
//       ))}

//       {/* ================= DETAILS MODAL ================= */}
//       <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="md">
//         <DialogTitle>Document Details</DialogTitle>

//         <DialogContent>
//           <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
//             <Tab label="Details" />
//             <Tab label="Images" />
//             <Tab label="History" />
//           </Tabs>

//           {tab === 0 && selected && (
//             <Grid container spacing={2}>
//               <Grid item xs={6}>
//                 <Typography><b>User:</b> {selected.user_name}</Typography>
//                 <Typography><b>Phone:</b> {selected.phone_number}</Typography>
//                 <Typography><b>Status:</b> {selected.status}</Typography>
//               </Grid>
//               <Grid item xs={6}>
//                 <Typography><b>Submitted:</b> {formatDate(selected.submitted_at)}</Typography>
//                 {selected.rejection_reason && (
//                   <Typography color="error">
//                     <b>Reason:</b> {selected.rejection_reason}
//                   </Typography>
//                 )}
//               </Grid>
//             </Grid>
//           )}

//           {tab === 1 && selected && (
//             <Stack direction="row" spacing={2}>
//               {["front_image_url", "back_image_url", "selfie_image_url"].map(k =>
//                 selected[k] ? (
//                   <img
//                     key={k}
//                     src={selected[k]}
//                     alt={k}
//                     style={{ width: 180, cursor: "pointer" }}
//                     onClick={() =>
//                       setImageModal({ open: true, url: selected[k], title: k })
//                     }
//                   />
//                 ) : null
//               )}
//             </Stack>
//           )}

//           {tab === 2 && (
//             loadingHistory ? (
//               <Typography>Loading history…</Typography>
//             ) : history.length === 0 ? (
//               <Typography>No history</Typography>
//             ) : (
//               history.map(h => (
//                 <Box key={h.id} p={2} border="1px solid #eee" mb={1}>
//                   <Typography fontWeight={600}>{h.action}</Typography>
//                   <Typography variant="caption">
//                     {formatDate(h.created_at)}
//                   </Typography>
//                   {h.notes && <Typography color="error">{h.notes}</Typography>}
//                 </Box>
//               ))
//             )
//           )}
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={() => setSelected(null)}>Close</Button>
//           {selected?.status === "pending" && (
//             <>
//               <Button color="error" onClick={() => setRejectOpen(true)}>
//                 Reject
//               </Button>
//               <Button variant="contained" onClick={approveDocument}>
//                 Approve
//               </Button>
//             </>
//           )}
//         </DialogActions>
//       </Dialog>

//       {/* ================= REJECT MODAL ================= */}
//       <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)}>
//         <DialogTitle>Reject Document</DialogTitle>
//         <DialogContent>
//           <TextField
//             fullWidth
//             multiline
//             rows={3}
//             placeholder="Enter rejection reason"
//             value={rejectReason}
//             onChange={(e) => setRejectReason(e.target.value)}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
//           <Button color="error" variant="contained" onClick={rejectDocument}>
//             Reject
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* ================= IMAGE PREVIEW ================= */}
//       <Dialog
//         open={imageModal.open}
//         onClose={() => setImageModal({ open: false, url: "", title: "" })}
//         maxWidth="lg"
//       >
//         <DialogTitle>{imageModal.title}</DialogTitle>
//         <img src={imageModal.url} alt="preview" style={{ width: "100%" }} />
//       </Dialog>

//       {/* ================= SNACKBAR ================= */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar(s => ({ ...s, open: false }))}
//       >
//         <Alert severity={snackbar.severity} variant="filled">
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Snackbar,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
  Grid,
  Button
} from "@mui/material";
import { ExpandMore, Search } from "@mui/icons-material";
import { useCallback } from "react";
/* ================= CONFIG ================= */
const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://192.168.1.13:8000/api/v1"
    : "https://your-api-domain.com/api/v1";

/* ================= SAFE FETCH ================= */
async function safeFetch(url, options = {}) {
  const res = await fetch(url, options);

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}

export default function AdminDocuments({ adminUsername = "Admin" }) {
  /* ================= STATE ================= */
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState(0);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [imageModal, setImageModal] = useState({
    open: false,
    url: "",
    title: ""
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  /* ================= HELPERS ================= */
  const safeText = (v) => (v ? v : "—");
  const formatDate = (d) => (d ? new Date(d).toLocaleString() : "—");

  /* ================= LOAD DOCUMENTS ================= */

const loadDocuments = useCallback(async () => {
  try {
    const data = await safeFetch(
      `${API_BASE_URL}/admin/documents?status=${status}&page=1&limit=50`
    );
    setDocuments(Array.isArray(data.documents) ? data.documents : []);
  } catch (err) {
    setDocuments([]);
    setSnackbar({
      open: true,
      message: err.message || "Failed to load documents",
      severity: "error"
    });
  }
}, [status]);


  // useEffect(() => {
  //   let mounted = true;
  //   if (mounted) loadDocuments();
  //   return () => {
  //     mounted = false;
  //   };
  // }, [status]);
useEffect(() => {
  loadDocuments();
}, [loadDocuments]);

  /* ================= LOAD HISTORY ================= */
  const loadHistory = async (documentId) => {
    if (!documentId) return;
    try {
      setLoadingHistory(true);
      const data = await safeFetch(
        `${API_BASE_URL}/admin/documents/${documentId}/history`
      );
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  /* ================= FILTER ================= */
  const filteredDocuments = useMemo(() => {
    return documents.filter((d) =>
      [d.document_number, d.user_name, d.phone_number]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [documents, search]);

  /* ================= ACTIONS ================= */
  const approveDocument = async () => {
    if (!selected?.id) return;

    try {
      await safeFetch(`${API_BASE_URL}/documents/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: selected.id,
          status: "approved",
          admin_username: adminUsername
        })
      });

      setSnackbar({
        open: true,
        message: "Document approved",
        severity: "success"
      });

      setSelected(null);
      loadDocuments();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Approval failed",
        severity: "error"
      });
    }
  };

  const rejectDocument = async () => {
    if (!selected?.id || !rejectReason.trim()) {
      setSnackbar({
        open: true,
        message: "Rejection reason is required",
        severity: "warning"
      });
      return;
    }

    try {
      await safeFetch(`${API_BASE_URL}/documents/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: selected.id,
          status: "rejected",
          rejection_reason: rejectReason.trim(),
          admin_username: adminUsername
        })
      });

      setSnackbar({
        open: true,
        message: "Document rejected",
        severity: "success"
      });

      setRejectOpen(false);
      setRejectReason("");
      setSelected(null);
      setTab(0);
      loadDocuments();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Rejection failed",
        severity: "error"
      });
    }
  };

  /* ================= RENDER ================= */
  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Document Verification
      </Typography>

      <Tabs value={status} onChange={(e, v) => setStatus(v)} sx={{ mb: 2 }}>
        <Tab value="pending" label="Pending" />
        <Tab value="approved" label="Approved" />
        <Tab value="rejected" label="Rejected" />
        <Tab value="all" label="All" />
      </Tabs>

      <TextField
        fullWidth
        placeholder="Search by name, phone, document number"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          )
        }}
        sx={{ mb: 3 }}
      />

      {filteredDocuments.length === 0 ? (
  <Box
    textAlign="center"
    p={5}
    color="text.secondary"
    border="1px dashed #ddd"
    borderRadius={2}
  >
    <Typography variant="h6" gutterBottom>
      No documents found
    </Typography>
    <Typography variant="body2">
      There are no documents matching the selected status or search criteria.
    </Typography>
  </Box>
) : (
  filteredDocuments.map((doc) => (
    <Accordion key={doc.id} sx={{ mb: 1 }}>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        onClick={() => {
          setSelected(doc);
          setTab(0);
          loadHistory(doc.id);
        }}
      >
        <Box display="flex" justifyContent="space-between" width="100%">
          <Typography>
            {safeText(doc.document_type)} — {safeText(doc.document_number)}
          </Typography>
          <Chip label={safeText(doc.status)} />
        </Box>
      </AccordionSummary>
      <AccordionDetails />
    </Accordion>
  ))
)}


      {/* DETAILS MODAL */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} fullWidth maxWidth="md">
        <DialogTitle>Document Details</DialogTitle>

        <DialogContent>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Details" />
            <Tab label="Images" />
            <Tab label="History" />
          </Tabs>

          {tab === 0 && selected && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography><b>User:</b> {safeText(selected.user_name)}</Typography>
                <Typography><b>Phone:</b> {safeText(selected.phone_number)}</Typography>
                <Typography><b>Status:</b> {safeText(selected.status)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography><b>Submitted:</b> {formatDate(selected.submitted_at)}</Typography>
                {selected.rejection_reason && (
                  <Typography color="error">
                    <b>Reason:</b> {selected.rejection_reason}
                  </Typography>
                )}
              </Grid>
            </Grid>
          )}

          {tab === 1 && selected && (
            <Stack direction="row" spacing={2}>
              {["front_image_url", "back_image_url", "selfie_image_url"].map(
                (k) =>
                  selected[k] && (
                    <img
                      key={k}
                      src={selected[k]}
                      alt={k}
                      onError={(e) => (e.target.style.display = "none")}
                      style={{ width: 180, cursor: "pointer" }}
                      onClick={() =>
                        setImageModal({ open: true, url: selected[k], title: k })
                      }
                    />
                  )
              )}
            </Stack>
          )}

          {tab === 2 && (
            loadingHistory ? (
              <Typography>Loading history…</Typography>
            ) : history.length === 0 ? (
              <Typography>No history</Typography>
            ) : (
              history.map((h) => (
                <Box key={h.id} p={2} border="1px solid #eee" mb={1}>
                  <Typography fontWeight={600}>{safeText(h.action)}</Typography>
                  <Typography variant="caption">
                    {formatDate(h.created_at)}
                  </Typography>
                  {h.notes && <Typography color="error">{h.notes}</Typography>}
                </Box>
              ))
            )
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
          {selected?.status === "pending" && (
            <>
              <Button color="error" onClick={() => setRejectOpen(true)}>
                Reject
              </Button>
              <Button variant="contained" onClick={approveDocument}>
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* REJECT MODAL */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)}>
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Enter rejection reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={rejectDocument}>
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* IMAGE PREVIEW */}
      <Dialog
        open={imageModal.open}
        onClose={() => setImageModal({ open: false, url: "", title: "" })}
        maxWidth="lg"
      >
        <DialogTitle>{imageModal.title}</DialogTitle>
        <img src={imageModal.url} alt="preview" style={{ width: "100%" }} />
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
