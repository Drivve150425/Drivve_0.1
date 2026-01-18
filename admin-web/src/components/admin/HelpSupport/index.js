// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Chip,
//   InputAdornment,
//   Stack,
//   MenuItem,
//   Snackbar,
//   Alert
// } from "@mui/material";
// import {
//   Add,
//   Edit,
//   ExpandMore,
//   Visibility,
//   VisibilityOff,
//   Search,
//   Delete
// } from "@mui/icons-material";

// const API_BASE_URL = "http://localhost:8000/api/v1";

// export default function AdminFaqs() {
//   /* =====================
//      STATE
//   ===================== */
//   const [faqs, setFaqs] = useState([]);
//   const [search, setSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("ALL");

//   const [openDialog, setOpenDialog] = useState(false);
//   const [editingFaq, setEditingFaq] = useState(null);

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success"
//   });

//   const [form, setForm] = useState({
//     category: "",
//     question: "",
//     answer: ""
//   });

//   /* =====================
//      LOAD FAQS
//   ===================== */
//   const loadFaqs = async () => {
//     try {
//       const res = await fetch(`${API_BASE_URL}/admin/faqs`);
//       const data = await res.json();
//       setFaqs(data);
//     } catch {
//       showSnackbar("Failed to load FAQs", "error");
//     }
//   };

//   useEffect(() => {
//     loadFaqs();
//   }, []);

//   /* =====================
//      UNIQUE CATEGORIES
//   ===================== */
//   const categories = useMemo(() => {
//     const unique = new Set(faqs.map(f => f.category));
//     return ["ALL", ...Array.from(unique)];
//   }, [faqs]);

//   /* =====================
//      SNACKBAR
//   ===================== */
//   const showSnackbar = (message, severity = "success") => {
//     setSnackbar({ open: true, message, severity });
//   };

//   /* =====================
//      DIALOG HANDLERS
//   ===================== */
//   const openAddDialog = () => {
//     setEditingFaq(null);
//     setForm({ category: "", question: "", answer: "" });
//     setOpenDialog(true);
//   };

//   const openEditDialog = (faq) => {
//     setEditingFaq(faq);
//     setForm({
//       category: faq.category,
//       question: faq.question,
//       answer: faq.answer
//     });
//     setOpenDialog(true);
//   };

//   const closeDialog = () => {
//     setOpenDialog(false);
//     setEditingFaq(null);
//   };

//   /* =====================
//      SAVE FAQ (POST)
//   ===================== */
//   const saveFaq = async () => {
//     const url = editingFaq
//       ? `${API_BASE_URL}/admin/faqs/update`
//       : `${API_BASE_URL}/admin/faqs/create`;

//     const payload = editingFaq
//       ? { id: editingFaq.id, ...form }
//       : form;

//     try {
//       await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload)
//       });

//       closeDialog();
//       loadFaqs();
//       showSnackbar(editingFaq ? "FAQ updated successfully" : "FAQ created successfully");
//     } catch {
//       showSnackbar("Failed to save FAQ", "error");
//     }
//   };

//   /* =====================
//      TOGGLE ACTIVE / INACTIVE
//   ===================== */
//   const toggleStatus = async (faq) => {
//     try {
//       await fetch(`${API_BASE_URL}/admin/faqs/status`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id: faq.id,
//           is_active: !faq.is_active
//         })
//       });

//       loadFaqs();
//       showSnackbar(faq.is_active ? "FAQ deactivated" : "FAQ activated");
//     } catch {
//       showSnackbar("Failed to update status", "error");
//     }
//   };

//   /* =====================
//      SOFT DELETE FAQ
//   ===================== */
//   const deleteFaq = async (faq) => {
//     if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

//     try {
//       await fetch(`${API_BASE_URL}/admin/faqs/delete`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: faq.id })
//       });

//       loadFaqs();
//       showSnackbar("FAQ deleted successfully");
//     } catch {
//       showSnackbar("Failed to delete FAQ", "error");
//     }
//   };

//   /* =====================
//      FILTERED FAQS
//   ===================== */
//   const filteredFaqs = faqs.filter(f => {
//     const matchesSearch =
//       f.question.toLowerCase().includes(search.toLowerCase()) ||
//       f.answer.toLowerCase().includes(search.toLowerCase());

//     const matchesCategory =
//       categoryFilter === "ALL" || f.category === categoryFilter;

//     return matchesSearch && matchesCategory;
//   });

//   /* =====================
//      RENDER
//   ===================== */
//   return (
//     <Box p={3}>
//       {/* HEADER */}
//       <Stack
//         direction={{ xs: "column", sm: "row" }}
//         justifyContent="space-between"
//         alignItems={{ xs: "flex-start", sm: "center" }}
//         spacing={2}
//         mb={3}
//       >
//         <Box>
//           <Typography variant="h5">FAQ Management</Typography>
//           <Typography color="text.secondary">
//             Manage FAQs shown to users
//           </Typography>
//         </Box>

//         <Button startIcon={<Add />} variant="contained" onClick={openAddDialog}>
//           Add FAQ
//         </Button>
//       </Stack>

//       {/* FILTERS */}
//       <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
//         <TextField
//           fullWidth
//           placeholder="Search FAQs..."
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search />
//               </InputAdornment>
//             )
//           }}
//         />

//         <TextField
//           select
//           label="Category"
//           value={categoryFilter}
//           onChange={e => setCategoryFilter(e.target.value)}
//           sx={{ minWidth: 200 }}
//         >
//           {categories.map(cat => (
//             <MenuItem key={cat} value={cat}>
//               {cat}
//             </MenuItem>
//           ))}
//         </TextField>
//       </Stack>

//       {/* FAQ LIST */}
//       {filteredFaqs.map(faq => (
//         <Accordion key={faq.id} sx={{ mb: 1 }}>
//           <AccordionSummary expandIcon={<ExpandMore />}>
//             <Box display="flex" alignItems="center" width="100%">
//               <Typography flex={1} fontWeight={500}>
//                 {faq.question}
//               </Typography>

//               <Chip
//                 label={faq.is_active ? "Active" : "Inactive"}
//                 color={faq.is_active ? "success" : "default"}
//                 size="small"
//                 sx={{ mr: 2 }}
//               />
//             </Box>
//           </AccordionSummary>

//           <AccordionDetails>
//             <Typography mb={2}>{faq.answer}</Typography>
//             <Typography variant="caption" color="text.secondary">
//               Category: {faq.category}
//             </Typography>

//             <Box display="flex" justifyContent="flex-end" mt={2}>
//               <IconButton onClick={() => openEditDialog(faq)}>
//                 <Edit />
//               </IconButton>

//               <IconButton onClick={() => toggleStatus(faq)}>
//                 {faq.is_active ? <VisibilityOff /> : <Visibility />}
//               </IconButton>

//               <IconButton color="error" onClick={() => deleteFaq(faq)}>
//                 <Delete />
//               </IconButton>
//             </Box>
//           </AccordionDetails>
//         </Accordion>
//       ))}

//       {/* ADD / EDIT DIALOG */}
//       <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           {editingFaq ? "Edit FAQ" : "Add FAQ"}
//         </DialogTitle>

//         <DialogContent>
//           <Box display="flex" flexDirection="column" gap={2} mt={1}>
//             <TextField
//               label="Category"
//               value={form.category}
//               onChange={e => setForm({ ...form, category: e.target.value })}
//               required
//             />
//             <TextField
//               label="Question"
//               value={form.question}
//               onChange={e => setForm({ ...form, question: e.target.value })}
//               required
//             />
//             <TextField
//               label="Answer"
//               value={form.answer}
//               onChange={e => setForm({ ...form, answer: e.target.value })}
//               multiline
//               rows={4}
//               required
//             />
//           </Box>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={closeDialog}>Cancel</Button>
//           <Button variant="contained" onClick={saveFaq}>
//             {editingFaq ? "Update" : "Create"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* SNACKBAR */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//       >
//         <Alert
//           severity={snackbar.severity}
//           variant="filled"
//           onClose={() => setSnackbar({ ...snackbar, open: false })}
//         >
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
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  Stack,
  MenuItem,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Add,
  Edit,
  ExpandMore,
  Visibility,
  VisibilityOff,
  Search,
  Delete
} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:8000/api/v1";

/* =====================
   VALIDATION HELPER
===================== */
const isFieldValid = (key, value) => {
  return value && value.trim().length > 0;
};

export default function AdminFaqs() {
  /* =====================
     STATE
  ===================== */
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [openDialog, setOpenDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [form, setForm] = useState({
    category: "",
    question: "",
    answer: ""
  });

  const [errors, setErrors] = useState({});

  /* =====================
     LOAD FAQS
  ===================== */
  const loadFaqs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/faqs`);
      setFaqs(await res.json());
    } catch {
      showSnackbar("Failed to load FAQs", "error");
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  /* =====================
     UNIQUE CATEGORIES
  ===================== */
  const categories = useMemo(() => {
    const unique = new Set(faqs.map(f => f.category));
    return ["ALL", ...Array.from(unique)];
  }, [faqs]);

  /* =====================
     SNACKBAR
  ===================== */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  /* =====================
     DIALOG HANDLERS
  ===================== */
  const openAddDialog = () => {
    setEditingFaq(null);
    setForm({ category: "", question: "", answer: "" });
    setErrors({});
    setOpenDialog(true);
  };

  const openEditDialog = (faq) => {
    setEditingFaq(faq);
    setForm({
      category: faq.category,
      question: faq.question,
      answer: faq.answer
    });
    setErrors({});
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setEditingFaq(null);
  };

  /* =====================
     FORM VALIDATION
  ===================== */
  const validateForm = () => {
    const newErrors = {};

    Object.keys(form).forEach(key => {
      if (!isFieldValid(key, form[key])) {
        newErrors[key] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* =====================
     SAVE FAQ
  ===================== */
  const saveFaq = async () => {
    if (!validateForm()) {
      showSnackbar("Please fix validation errors", "error");
      return;
    }

    const url = editingFaq
      ? `${API_BASE_URL}/admin/faqs/update`
      : `${API_BASE_URL}/admin/faqs/create`;

    const payload = editingFaq
      ? { id: editingFaq.id, ...form }
      : form;

    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      closeDialog();
      loadFaqs();
      showSnackbar(editingFaq ? "FAQ updated successfully" : "FAQ created successfully");
    } catch {
      showSnackbar("Failed to save FAQ", "error");
    }
  };

  /* =====================
     TOGGLE STATUS
  ===================== */
  const toggleStatus = async (faq) => {
    try {
      await fetch(`${API_BASE_URL}/admin/faqs/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: faq.id,
          is_active: !faq.is_active
        })
      });

      loadFaqs();
      showSnackbar(faq.is_active ? "FAQ deactivated" : "FAQ activated");
    } catch {
      showSnackbar("Failed to update status", "error");
    }
  };

  /* =====================
     DELETE FAQ
  ===================== */
  const deleteFaq = async (faq) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      await fetch(`${API_BASE_URL}/admin/faqs/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: faq.id })
      });

      loadFaqs();
      showSnackbar("FAQ deleted successfully");
    } catch {
      showSnackbar("Failed to delete FAQ", "error");
    }
  };

  /* =====================
     FILTERED FAQS
  ===================== */
  const filteredFaqs = faqs.filter(f => {
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" || f.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  /* =====================
     RENDER
  ===================== */
  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Help & Support</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={openAddDialog}>
          Add FAQ
        </Button>
      </Stack>

      {/* FILTERS */}
      <Stack direction="row" spacing={2} mb={3}>
        <TextField
          fullWidth
          placeholder="Search FAQs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />

        <TextField
          select
          label="Category"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {categories.map(cat => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* FAQ LIST */}
      {filteredFaqs.map(faq => (
        <Accordion key={faq.id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography flex={1}>{faq.question}</Typography>
            <Chip
              label={faq.is_active ? "Active" : "Inactive"}
              color={faq.is_active ? "success" : "default"}
              size="small"
            />
          </AccordionSummary>

          <AccordionDetails>
            <Typography mb={1}>{faq.answer}</Typography>
            <Typography variant="caption">Category: {faq.category}</Typography>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <IconButton onClick={() => openEditDialog(faq)}>
                <Edit />
              </IconButton>
              <IconButton onClick={() => toggleStatus(faq)}>
                {faq.is_active ? <VisibilityOff /> : <Visibility />}
              </IconButton>
              <IconButton color="error" onClick={() => deleteFaq(faq)}>
                <Delete />
              </IconButton>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* ADD / EDIT DIALOG */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            {["category", "question", "answer"].map(key => {
              const valid = isFieldValid(key, form[key]) && !errors[key];

              return (
                <TextField
                  key={key}
                  label={key.toUpperCase()}
                  value={form[key]}
                  multiline={key === "answer"}
                  rows={key === "answer" ? 4 : 1}
                  required
                  error={!!errors[key]}
                  color={valid ? "success" : "primary"}
                  helperText={errors[key] || " "}
                  onChange={e => {
                    const value = e.target.value;
                    setForm({ ...form, [key]: value });

                    if (isFieldValid(key, value)) {
                      setErrors({ ...errors, [key]: "" });
                    }
                  }}
                />
              );
            })}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveFaq}
            disabled={Object.values(form).some(v => !v)}
          >
            {editingFaq ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
