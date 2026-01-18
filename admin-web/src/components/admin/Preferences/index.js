// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   MenuItem,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Stack,
//   Snackbar,
//   Alert,
//   InputAdornment,
//   Card,
//   CardContent,
//   IconButton,
//   Chip
// } from "@mui/material";
// import {
//   Add,
//   Edit,
//   Search,
//   Visibility,
//   VisibilityOff,
//   Delete
// } from "@mui/icons-material";

// const API_BASE_URL = "http://localhost:8000/api/v1";

// export default function AdminMatchingPreferences() {
//   /* =====================
//      STATE
//   ===================== */
//   const [items, setItems] = useState([]);
//   const [search, setSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("ALL");

//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState(null);

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success"
//   });

//   const [form, setForm] = useState({
//     key: "",
//     label: "",
//     category: "",
//     input_type: "toggle",
//     options: ""
//   });

//   /* =====================
//      LOAD DATA
//   ===================== */
//   const loadData = async () => {
//     const res = await fetch(`${API_BASE_URL}/admin/matching-preferences`);
//     const data = await res.json();
//     setItems(data);
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   /* =====================
//      DERIVED CATEGORIES
//   ===================== */
//   const categories = useMemo(() => {
//     const set = new Set(items.map(i => i.category));
//     return ["ALL", ...Array.from(set)];
//   }, [items]);

//   /* =====================
//      FILTERED DATA
//   ===================== */
//   const filteredItems = items.filter(i => {
//     const matchesSearch =
//       i.label.toLowerCase().includes(search.toLowerCase()) ||
//       i.key.toLowerCase().includes(search.toLowerCase());

//     const matchesCategory =
//       categoryFilter === "ALL" || i.category === categoryFilter;

//     return matchesSearch && matchesCategory;
//   });

//   /* =====================
//      SNACKBAR
//   ===================== */
//   const showSnackbar = (message, severity = "success") => {
//     setSnackbar({ open: true, message, severity });
//   };

//   /* =====================
//      ADD / EDIT HANDLERS
//   ===================== */
//   const handleAdd = () => {
//     setEditing(null); // IMPORTANT
//     setForm({
//       key: "",
//       label: "",
//       category: "",
//       input_type: "toggle",
//       options: ""
//     });
//     setOpen(true);
//   };

//   const handleEdit = (item) => {
//     setEditing(item);
//     setForm({
//       key: item.key,
//       label: item.label,
//       category: item.category,
//       input_type: item.input_type,
//       options: JSON.stringify(item.options || [])
//     });
//     setOpen(true);
//   };

//   const closeDialog = () => {
//     setOpen(false);
//     setEditing(null);
//   };

//   /* =====================
//      SAVE (POST ONLY)
//   ===================== */
//   const saveItem = async () => {
//     const url = editing
//       ? `${API_BASE_URL}/admin/matching-preferences/update`
//       : `${API_BASE_URL}/admin/matching-preferences/create`;

//     const payload = {
//       ...form,
//       id: editing?.id,
//       options:
//         form.input_type === "toggle"
//           ? null
//           : JSON.parse(form.options || "[]")
//     };

//     await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     });

//     setOpen(false);
//     loadData();
//     showSnackbar(editing ? "Preference updated successfully" : "Preference created successfully");
//   };

//   /* =====================
//      ACTIVATE / DEACTIVATE
//   ===================== */
//   const toggleStatus = async (item) => {
//     await fetch(`${API_BASE_URL}/admin/matching-preferences/status`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         id: item.id,
//         is_active: !item.is_active
//       })
//     });

//     loadData();
//     showSnackbar(item.is_active ? "Preference deactivated" : "Preference activated");
//   };

//   /* =====================
//      SOFT DELETE
//   ===================== */
//   const deleteItem = async (item) => {
//     if (!window.confirm("Are you sure you want to delete this preference?")) return;

//     await fetch(`${API_BASE_URL}/admin/matching-preferences/delete`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: item.id })
//     });

//     loadData();
//     showSnackbar("Preference deleted");
//   };

//   /* =====================
//      RENDER
//   ===================== */
//   return (
//     <Box p={3}>
//       {/* HEADER */}
//       <Stack direction="row" justifyContent="space-between" mb={3}>
//         <Typography variant="h5">Matching Preferences</Typography>
//         <Button startIcon={<Add />} variant="contained" onClick={handleAdd}>
//           Add Preference
//         </Button>
//       </Stack>

//       {/* FILTERS */}
//       <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
//         <TextField
//           fullWidth
//           placeholder="Search..."
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

//       {/* LIST */}
//       {filteredItems.map(item => (
//         <Card key={item.id} sx={{ mb: 2 }}>
//           <CardContent>
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Box>
//                 <Typography fontWeight={600}>{item.label}</Typography>
//                 <Typography variant="caption">
//                   {item.key} • {item.category} • {item.input_type}
//                 </Typography>
//               </Box>

//               <Stack direction="row" alignItems="center" spacing={1}>
//                 <Chip
//                   label={item.is_active ? "Active" : "Inactive"}
//                   color={item.is_active ? "success" : "default"}
//                   size="small"
//                 />

//                 <IconButton onClick={() => handleEdit(item)}>
//                   <Edit />
//                 </IconButton>

//                 <IconButton onClick={() => toggleStatus(item)}>
//                   {item.is_active ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>

//                 <IconButton color="error" onClick={() => deleteItem(item)}>
//                   <Delete />
//                 </IconButton>
//               </Stack>
//             </Stack>
//           </CardContent>
//         </Card>
//       ))}

//       {/* ADD / EDIT DIALOG */}
//       <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
//         <DialogTitle>
//           {editing ? "Edit Preference" : "Add Preference"}
//         </DialogTitle>

//         <DialogContent>
//           <Stack spacing={2} mt={1}>
//             <TextField
//               label="Key"
//               value={form.key}
//               onChange={e => setForm({ ...form, key: e.target.value })}
//               fullWidth
//             />

//             <TextField
//               label="Label"
//               value={form.label}
//               onChange={e => setForm({ ...form, label: e.target.value })}
//               fullWidth
//             />

//             {/* CATEGORY FIELD */}
//             {editing ? (
//               <TextField
//                 select
//                 label="Category"
//                 value={form.category}
//                 onChange={e => setForm({ ...form, category: e.target.value })}
//                 fullWidth
//               >
//                 {categories
//                   .filter(c => c !== "ALL")
//                   .map(cat => (
//                     <MenuItem key={cat} value={cat}>
//                       {cat}
//                     </MenuItem>
//                   ))}
//               </TextField>
//             ) : (
//               <TextField
//                 label="Category"
//                 placeholder="Enter new category"
//                 value={form.category}
//                 onChange={e => setForm({ ...form, category: e.target.value })}
//                 fullWidth
//               />
//             )}

//             <TextField
//               select
//               label="Input Type"
//               value={form.input_type}
//               onChange={e => setForm({ ...form, input_type: e.target.value })}
//               fullWidth
//             >
//               <MenuItem value="toggle">Toggle</MenuItem>
//               <MenuItem value="single_select">Single Select</MenuItem>
//               <MenuItem value="multi_select">Multi Select</MenuItem>
//             </TextField>

//             {form.input_type !== "toggle" && (
//               <TextField
//                 label="Options (JSON Array)"
//                 multiline
//                 rows={3}
//                 value={form.options}
//                 onChange={e => setForm({ ...form, options: e.target.value })}
//                 placeholder='["Option 1", "Option 2"]'
//                 fullWidth
//               />
//             )}
//           </Stack>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={closeDialog}>Cancel</Button>
//           <Button variant="contained" onClick={saveItem}>
//             {editing ? "Update" : "Create"}
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
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   MenuItem,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Stack,
//   Snackbar,
//   Alert,
//   InputAdornment,
//   Card,
//   CardContent,
//   IconButton,
//   Chip
// } from "@mui/material";
// import {
//   Add,
//   Edit,
//   Search,
//   Visibility,
//   VisibilityOff,
//   Delete
// } from "@mui/icons-material";

// const API_BASE_URL = "http://localhost:8000/api/v1";

// export default function AdminMatchingPreferences() {
//   /* =====================
//      STATE
//   ===================== */
//   const [items, setItems] = useState([]);
//   const [search, setSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("ALL");

//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [addingNewCategory, setAddingNewCategory] = useState(false);

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success"
//   });

//   const [form, setForm] = useState({
//     key: "",
//     label: "",
//     category: "",
//     input_type: "toggle",
//     options: ""
//   });

//   /* =====================
//      SNACKBAR
//   ===================== */
//   const showSnackbar = (message, severity = "success") => {
//     setSnackbar({ open: true, message, severity });
//   };

//   /* =====================
//      SAFE FETCH
//   ===================== */
//   const safeFetch = async (url, options = {}) => {
//     try {
//       const res = await fetch(url, options);
//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Server error");
//       }
//       return await res.json();
//     } catch (err) {
//       console.error(err);
//       showSnackbar(err.message || "Something went wrong", "error");
//       throw err;
//     }
//   };

//   /* =====================
//      LOAD DATA
//   ===================== */
//   const loadData = async () => {
//     try {
//       const data = await safeFetch(
//         `${API_BASE_URL}/admin/matching-preferences`
//       );
//       setItems(data || []);
//     } catch {}
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   /* =====================
//      DERIVED CATEGORIES
//   ===================== */
//   const categories = useMemo(() => {
//     const set = new Set(items.map(i => i.category));
//     return ["ALL", ...Array.from(set)];
//   }, [items]);

//   /* =====================
//      FILTERED DATA
//   ===================== */
//   const filteredItems = items.filter(i => {
//     const matchesSearch =
//       i.label.toLowerCase().includes(search.toLowerCase()) ||
//       i.key.toLowerCase().includes(search.toLowerCase());

//     const matchesCategory =
//       categoryFilter === "ALL" || i.category === categoryFilter;

//     return matchesSearch && matchesCategory;
//   });

//   /* =====================
//      ADD / EDIT
//   ===================== */
//   const handleAdd = () => {
//     setEditing(null);
//     setAddingNewCategory(false);
//     setForm({
//       key: "",
//       label: "",
//       category: "",
//       input_type: "toggle",
//       options: ""
//     });
//     setOpen(true);
//   };

//   const handleEdit = (item) => {
//     setEditing(item);
//     setAddingNewCategory(false);
//     setForm({
//       key: item.key,
//       label: item.label,
//       category: item.category,
//       input_type: item.input_type,
//       options: JSON.stringify(item.options || [])
//     });
//     setOpen(true);
//   };

//   const closeDialog = () => {
//     setOpen(false);
//     setEditing(null);
//     setAddingNewCategory(false);
//   };

//   /* =====================
//      SAVE
//   ===================== */
//   const saveItem = async () => {
//     let parsedOptions = null;

//     try {
//       if (form.input_type !== "toggle") {
//         parsedOptions = JSON.parse(form.options || "[]");
//         if (!Array.isArray(parsedOptions)) {
//           throw new Error();
//         }
//       }
//     } catch {
//       showSnackbar("Options must be a valid JSON array", "error");
//       return;
//     }

//     try {
//       const url = editing
//         ? `${API_BASE_URL}/admin/matching-preferences/update`
//         : `${API_BASE_URL}/admin/matching-preferences/create`;

//       await safeFetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...form,
//           id: editing?.id,
//           options: parsedOptions
//         })
//       });

//       setOpen(false);
//       loadData();
//       showSnackbar(editing ? "Preference updated" : "Preference created");
//     } catch {}
//   };

//   /* =====================
//      STATUS TOGGLE
//   ===================== */
//   const toggleStatus = async (item) => {
//     try {
//       await safeFetch(`${API_BASE_URL}/admin/matching-preferences/status`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id: item.id,
//           is_active: !item.is_active
//         })
//       });

//       loadData();
//       showSnackbar(item.is_active ? "Deactivated" : "Activated");
//     } catch {}
//   };

//   /* =====================
//      DELETE
//   ===================== */
//   const deleteItem = async (item) => {
//     if (!window.confirm("Are you sure you want to delete this preference?"))
//       return;

//     try {
//       await safeFetch(`${API_BASE_URL}/admin/matching-preferences/delete`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: item.id })
//       });

//       loadData();
//       showSnackbar("Preference deleted");
//     } catch {}
//   };

//   /* =====================
//      RENDER
//   ===================== */
//   return (
//     <Box p={3}>
//       {/* HEADER */}
//       <Stack direction="row" justifyContent="space-between" mb={3}>
//         <Typography variant="h5">Matching Preferences</Typography>
//         <Button startIcon={<Add />} variant="contained" onClick={handleAdd}>
//           Add Preference
//         </Button>
//       </Stack>

//       {/* FILTERS */}
//       <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
//         <TextField
//           fullWidth
//           placeholder="Search..."
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

//       {/* LIST */}
//       {filteredItems.map(item => (
//         <Card key={item.id} sx={{ mb: 2 }}>
//           <CardContent>
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Box>
//                 <Typography fontWeight={600}>{item.label}</Typography>
//                 <Typography variant="caption">
//                   {item.key} • {item.category} • {item.input_type}
//                 </Typography>
//               </Box>

//               <Stack direction="row" spacing={1} alignItems="center">
//                 <Chip
//                   label={item.is_active ? "Active" : "Inactive"}
//                   color={item.is_active ? "success" : "default"}
//                   size="small"
//                 />

//                 <IconButton onClick={() => handleEdit(item)}>
//                   <Edit />
//                 </IconButton>

//                 <IconButton onClick={() => toggleStatus(item)}>
//                   {item.is_active ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>

//                 <IconButton color="error" onClick={() => deleteItem(item)}>
//                   <Delete />
//                 </IconButton>
//               </Stack>
//             </Stack>
//           </CardContent>
//         </Card>
//       ))}

//       {/* ADD / EDIT DIALOG */}
//       <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
//         <DialogTitle>
//           {editing ? "Edit Preference" : "Add Preference"}
//         </DialogTitle>

//         <DialogContent>
//           <Stack spacing={2} mt={1}>
//             <TextField
//               label="Key"
//               value={form.key}
//               onChange={e => setForm({ ...form, key: e.target.value })}
//               fullWidth
//             />

//             <TextField
//               label="Label"
//               value={form.label}
//               onChange={e => setForm({ ...form, label: e.target.value })}
//               fullWidth
//             />

//             {/* CATEGORY */}
//             {editing ? (
//               <TextField
//                 select
//                 label="Category"
//                 value={form.category}
//                 onChange={e => setForm({ ...form, category: e.target.value })}
//                 fullWidth
//               >
//                 {categories.filter(c => c !== "ALL").map(cat => (
//                   <MenuItem key={cat} value={cat}>
//                     {cat}
//                   </MenuItem>
//                 ))}
//               </TextField>
//             ) : (
//               <>
//                 <TextField
//                   select
//                   label="Category"
//                   value={addingNewCategory ? "__new__" : form.category}
//                   onChange={e => {
//                     if (e.target.value === "__new__") {
//                       setAddingNewCategory(true);
//                       setForm({ ...form, category: "" });
//                     } else {
//                       setAddingNewCategory(false);
//                       setForm({ ...form, category: e.target.value });
//                     }
//                   }}
//                   fullWidth
//                 >
//                   {categories.filter(c => c !== "ALL").map(cat => (
//                     <MenuItem key={cat} value={cat}>
//                       {cat}
//                     </MenuItem>
//                   ))}
//                   <MenuItem value="__new__">➕ Add new category</MenuItem>
//                 </TextField>

//                 {addingNewCategory && (
//                   <TextField
//                     label="New Category Name"
//                     value={form.category}
//                     onChange={e =>
//                       setForm({ ...form, category: e.target.value })
//                     }
//                     fullWidth
//                   />
//                 )}
//               </>
//             )}

//             <TextField
//               select
//               label="Input Type"
//               value={form.input_type}
//               onChange={e => setForm({ ...form, input_type: e.target.value })}
//               fullWidth
//             >
//               <MenuItem value="toggle">Toggle</MenuItem>
//               <MenuItem value="single_select">Single Select</MenuItem>
//               <MenuItem value="multi_select">Multi Select</MenuItem>
//             </TextField>

//             {form.input_type !== "toggle" && (
//               <TextField
//                 label="Options (JSON Array)"
//                 multiline
//                 rows={3}
//                 value={form.options}
//                 onChange={e =>
//                   setForm({ ...form, options: e.target.value })
//                 }
//                 placeholder='["Option 1", "Option 2"]'
//                 fullWidth
//               />
//             )}
//           </Stack>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={closeDialog}>Cancel</Button>
//           <Button variant="contained" onClick={saveItem}>
//             {editing ? "Update" : "Create"}
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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Snackbar,
  Alert,
  InputAdornment,
  Card,
  CardContent,
  IconButton,
  Chip
} from "@mui/material";
import {
  Add,
  Edit,
  Search,
  Visibility,
  VisibilityOff,
  Delete
} from "@mui/icons-material";

const API_BASE_URL = "http://localhost:8000/api/v1";
const isFieldValid = (key, value, form) => {
  if (!value) return false;

  if (key === "options" && form.input_type !== "toggle") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) && parsed.length > 0;
    } catch {
      return false;
    }
  }

  return true;
};

export default function AdminMatchingPreferences() {
  /* =====================
     STATE
  ===================== */
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [addingNewCategory, setAddingNewCategory] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [form, setForm] = useState({
    key: "",
    label: "",
    category: "",
    input_type: "toggle",
    options: ""
  });

  const [errors, setErrors] = useState({});

  /* =====================
     HELPERS
  ===================== */
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const safeFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Server error");
      }
      return await res.json();
    } catch (err) {
      console.error(err);
      showSnackbar(err.message || "Something went wrong", "error");
      throw err;
    }
  };

  /* =====================
     LOAD DATA
  ===================== */
  const loadData = async () => {
    try {
      const data = await safeFetch(
        `${API_BASE_URL}/admin/matching-preferences`
      );
      setItems(data || []);
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =====================
     DERIVED DATA
  ===================== */
  const categories = useMemo(() => {
    const set = new Set(items.map(i => i.category));
    return ["ALL", ...Array.from(set)];
  }, [items]);

  const filteredItems = items.filter(i => {
    const matchesSearch =
      i.label.toLowerCase().includes(search.toLowerCase()) ||
      i.key.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" || i.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  /* =====================
     VALIDATION
  ===================== */
  const validateForm = () => {
  const newErrors = {};

  // if (!form.key.trim()) newErrors.key = "This field is required";
  // if (!form.label.trim()) newErrors.label = "This field is required";
  // if (!form.category.trim()) newErrors.category = "This field is required";
  // if (!form.input_type) newErrors.input_type = "This field is required";

  if (form.input_type !== "toggle") {
    if (!form.options.trim()) {
      newErrors.options = "This field is required";
    } else {
      try {
        const parsed = JSON.parse(form.options);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          newErrors.options = "Must be a non-empty JSON array";
        }
      } catch {
        newErrors.options = "Invalid JSON format";
      }
    }
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const isFormValid = useMemo(() => validateForm(), [form]);

  /* =====================
     ADD / EDIT
  ===================== */
  const handleAdd = () => {
    setEditing(null);
    setAddingNewCategory(false);
    setErrors({});
    setForm({
      key: "",
      label: "",
      category: "",
      input_type: "toggle",
      options: ""
    });
    setOpen(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setAddingNewCategory(false);
    setErrors({});
    setForm({
      key: item.key,
      label: item.label,
      category: item.category,
      input_type: item.input_type,
      options: JSON.stringify(item.options || [])
    });
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setAddingNewCategory(false);
    setErrors({});
  };

  /* =====================
     SAVE
  ===================== */
  const saveItem = async () => {
    if (!validateForm()) {
      showSnackbar("Please fix validation errors", "error");
      return;
    }

    try {
      const url = editing
        ? `${API_BASE_URL}/admin/matching-preferences/update`
        : `${API_BASE_URL}/admin/matching-preferences/create`;

      await safeFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: editing?.id,
          options:
            form.input_type === "toggle"
              ? null
              : JSON.parse(form.options)
        })
      });

      setOpen(false);
      loadData();
      showSnackbar(editing ? "Matching preference updated successfully" : "Matching preference created successfully");
    } catch {}
  };

  /* =====================
     STATUS / DELETE
  ===================== */
  const toggleStatus = async (item) => {
    try {
      await safeFetch(`${API_BASE_URL}/admin/matching-preferences/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          is_active: !item.is_active
        })
      });
      loadData();
      showSnackbar(item.is_active ? "Matching preference deactivated" : "Matching preference activated");
    } catch {}
  };

  const deleteItem = async (item) => {
    if (!window.confirm("Are you want to delete this matching preference?")) return;

    try {
      await safeFetch(`${API_BASE_URL}/admin/matching-preferences/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id })
      });
      loadData();
      showSnackbar("Matching preference deleted successfully");
    } catch {}
  };

  /* =====================
     RENDER
  ===================== */
  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Matching Preferences</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={handleAdd}>
          Add Preference
        </Button>
      </Stack>

      {/* FILTERS */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <TextField
          fullWidth
          placeholder="Search..."
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

      {/* LIST */}
      {filteredItems.map(item => (
        <Card key={item.id} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography fontWeight={600}>{item.label}</Typography>
                <Typography variant="caption">
                  {item.key} • {item.category} • {item.input_type}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Chip
                  label={item.is_active ? "Active" : "Inactive"}
                  color={item.is_active ? "success" : "default"}
                  size="small"
                />

                <IconButton onClick={() => handleEdit(item)}>
                  <Edit />
                </IconButton>

                <IconButton onClick={() => toggleStatus(item)}>
                  {item.is_active ? <VisibilityOff /> : <Visibility />}
                </IconButton>

                <IconButton color="error" onClick={() => deleteItem(item)}>
                  <Delete />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}

      {/* DIALOG */}
      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? "Edit Preference" : "Add Preference"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
           <TextField
  label="Key"
  required
  value={form.key}
  error={!!errors.key}
  helperText={errors.key || " "}
  color={form.key && !errors.key ? "success" : "primary"}
  onChange={e => {
    const value = e.target.value;
    setForm({ ...form, key: value });
    if (isFieldValid("key", value, form)) {
      setErrors({ ...errors, key: "" });
    }
  }}
  fullWidth
/>


     <TextField
  label="Label"
  required
  value={form.label}
  error={!!errors.label}
  helperText={errors.label || " "}
  color={form.label && !errors.label ? "success" : "primary"}
  onChange={e => {
    const value = e.target.value;
    setForm({ ...form, label: value });
    if (isFieldValid("label", value, form)) {
      setErrors({ ...errors, label: "" });
    }
  }}
  fullWidth
/>


            {/* CATEGORY */}
            {editing ? (
              <TextField
                select
                label="Category"
                required
                error={!!errors.category}
                helperText={errors.category}
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                fullWidth
              >
                {categories.filter(c => c !== "ALL").map(cat => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <>
                <TextField
                  select
                  label="Category"
                  required
                  error={!!errors.category}
                  helperText={errors.category}
                  value={addingNewCategory ? "__new__" : form.category}
                   color={
    (!addingNewCategory && form.category && !errors.category)
      ? "success"
      : "primary"
  }
                  onChange={e => {
                    if (e.target.value === "__new__") {
                      setAddingNewCategory(true);
                      setForm({ ...form, category: "" });
                    } else {
                      setAddingNewCategory(false);
                      setForm({ ...form, category: e.target.value });
                    }
                  }}
                  fullWidth
                >
                  {categories.filter(c => c !== "ALL").map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                  <MenuItem value="__new__">➕ Add new category</MenuItem>
                </TextField>

                {addingNewCategory && (
                  <TextField
                    label="New Category Name"
                    required
                    value={form.category}
                    color={
      form.category && !errors.category
        ? "success"
        : "primary"
    }
                    onChange={e =>
                      setForm({ ...form, category: e.target.value })
                    }
                    fullWidth
                  />
                )}
              </>
            )}

           <TextField
  select
  label="Input Type"
  required
  value={form.input_type}
  color={form.input_type ? "success" : "primary"}
  onChange={e => setForm({ ...form, input_type: e.target.value })}
  fullWidth
>

              <MenuItem value="toggle">Toggle</MenuItem>
              <MenuItem value="single_select">Single Select</MenuItem>
              <MenuItem value="multi_select">Multi Select</MenuItem>
            </TextField>

            {form.input_type !== "toggle" && (
              <TextField
  label="Options (JSON Array)"
  required
  multiline
  rows={3}
  value={form.options}
  error={!!errors.options}
  helperText={errors.options || " "}
  color={
    form.options && !errors.options ? "success" : "primary"
  }
  onChange={e => {
    const value = e.target.value;
    setForm({ ...form, options: value });

    if (isFieldValid("options", value, form)) {
      setErrors({ ...errors, options: "" });
    }
  }}
  fullWidth
/>

            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
         <Button
  variant="contained"
  onClick={saveItem}
  disabled={!isFormValid}
>
  {editing ? "Update" : "Save"}
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
