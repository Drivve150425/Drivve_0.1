// import React, { useEffect, useState } from "react";
// import {
//   Box, Typography, Button, TextField, Dialog,
//   DialogTitle, DialogContent, DialogActions,
//   Card, CardContent, Stack, IconButton,
//   Chip, Snackbar, Alert
// } from "@mui/material";
// import {
//   Add, Edit, Visibility, VisibilityOff, Delete
// } from "@mui/icons-material";

// const API = "http://localhost:8000/api/v1";

// export default function AdminPromotions() {
//   const [items, setItems] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [snack, setSnack] = useState("");

//   const [form, setForm] = useState({
//     company_name: "",
//     title: "",
//     description: "",
//     promo_code: "",
//     image_url: "",
//     valid_from: "",
//     valid_till: ""
//   });

//   const load = async () => {
//     const res = await fetch(`${API}/admin/promotions`);
//     setItems(await res.json());
//   };

//   useEffect(() => { load(); }, []);

//   const save = async () => {
//     const url = editing
//       ? `${API}/admin/promotions/update`
//       : `${API}/admin/promotions/create`;

//     const payload = editing ? { id: editing.id, ...form } : form;

//     await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     });

//     setOpen(false);
//     load();
//     setSnack(editing ? "Promotion updated" : "Promotion created");
//   };

//   const toggleStatus = async (p) => {
//     await fetch(`${API}/admin/promotions/status`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: p.id, is_active: !p.is_active })
//     });
//     load();
//     setSnack("Status updated");
//   };

//   const del = async (p) => {
//     if (!window.confirm("Delete this promotion?")) return;

//     await fetch(`${API}/admin/promotions/delete`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: p.id })
//     });
//     load();
//     setSnack("Promotion deleted");
//   };

//   return (
//     <Box p={3}>
//       <Stack direction="row" justifyContent="space-between" mb={3}>
//         <Typography variant="h5">Promotions</Typography>
//         <Button
//           startIcon={<Add />}
//           variant="contained"
//           onClick={() => {
//             setEditing(null);
//             setForm({
//               company_name: "",
//               title: "",
//               description: "",
//               promo_code: "",
//               image_url: "",
//               valid_from: "",
//               valid_till: ""
//             });
//             setOpen(true);
//           }}
//         >
//           Add Promotion
//         </Button>
//       </Stack>

//       {items.map(p => (
//         <Card key={p.id} sx={{ mb: 2 }}>
//           <CardContent>
//             <Stack direction="row" justifyContent="space-between">
//               <Box>
//                 <Typography fontWeight={600}>{p.title}</Typography>
//                 <Typography variant="caption">
//                   {p.company_name} • {p.promo_code || "—"}
//                 </Typography>
//               </Box>

//               <Stack direction="row" spacing={1}>
//                 <Chip
//                   label={p.is_active ? "Active" : "Inactive"}
//                   color={p.is_active ? "success" : "default"}
//                 />
//                 <IconButton onClick={() => {
//                   setEditing(p);
//                   setForm(p);
//                   setOpen(true);
//                 }}>
//                   <Edit />
//                 </IconButton>
//                 <IconButton onClick={() => toggleStatus(p)}>
//                   {p.is_active ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>
//                 <IconButton color="error" onClick={() => del(p)}>
//                   <Delete />
//                 </IconButton>
//               </Stack>
//             </Stack>
//           </CardContent>
//         </Card>
//       ))}

//       <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>{editing ? "Edit Promotion" : "Add Promotion"}</DialogTitle>
//         <DialogContent>
//           <Stack spacing={2} mt={1}>
//             {Object.keys(form).map(key => (
//               <TextField
//                 key={key}
//                 label={key.replace("_", " ").toUpperCase()}
//                 type={key.includes("valid_") ? "date" : "text"}
//                 InputLabelProps={key.includes("valid_") ? { shrink: true } : {}}
//                 value={form[key] || ""}
//                 onChange={e => setForm({ ...form, [key]: e.target.value })}
//               />
//             ))}
//           </Stack>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpen(false)}>Cancel</Button>
//           <Button variant="contained" onClick={save}>Save</Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack("")}>
//         <Alert severity="success" variant="filled">{snack}</Alert>
//       </Snackbar>
//     </Box>
//   );
// }
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Stack,
  IconButton,
  Chip,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Add,
  Edit,
  Visibility,
  VisibilityOff,
  Delete
} from "@mui/icons-material";

const API = "http://localhost:8000/api/v1";

/* ==========================
   FIELD CONFIG
========================== */
const READ_ONLY_FIELDS = ["id", "is_active", "created_at"];

const EDITABLE_FIELDS = [
  "company_name",
  "title",
  "description",
  "promo_code",
  "image_url",
  "valid_from",
  "valid_till"
];

const EMPTY_FORM = {
  company_name: "",
  title: "",
  description: "",
  promo_code: "",
  image_url: "",
  valid_from: "",
  valid_till: ""
};

// TODAY (YYYY-MM-DD)
const TODAY = new Date().toISOString().split("T")[0];

/* ==========================
   FIELD VALIDATION HELPER
========================== */
const isFieldValid = (key, value, form) => {
  if (!value) return false;

  if (key === "valid_till" && form.valid_from) {
    return value >= form.valid_from;
  }

  return true;
};

export default function AdminPromotions() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  /* ==========================
     LOAD DATA
  ========================== */
  const load = async () => {
    const res = await fetch(`${API}/admin/promotions`);
    setItems(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  /* ==========================
     VALIDATION
  ========================== */
  const validate = () => {
    const newErrors = {};

    EDITABLE_FIELDS.forEach((field) => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (
      form.valid_from &&
      form.valid_till &&
      form.valid_from > form.valid_till
    ) {
      newErrors.valid_till = "Valid till must be after valid from";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ==========================
     SAVE
  ========================== */
  const save = async () => {
    if (!validate()) {
      setSnack("Please fix validation errors");
      return;
    }

    const url = editing
      ? `${API}/admin/promotions/update`
      : `${API}/admin/promotions/create`;

    const payload = EDITABLE_FIELDS.reduce(
      (o, k) => ({ ...o, [k]: form[k] }),
      {}
    );

    if (editing) payload.id = editing.id;

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setOpen(false);
    setForm(EMPTY_FORM);
    setEditing(null);
    load();
    setSnack(editing ? "Promotion updated successfully" : "Promotion created successfully");
  };

  /* ==========================
     TOGGLE STATUS
  ========================== */
  const toggleStatus = async (p) => {
    await fetch(`${API}/admin/promotions/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: p.id,
        is_active: !p.is_active
      })
    });

    load();
    setSnack(p.is_active ? "Promotion Deactivated" : "Promotion Activated");
  };

  /* ==========================
     DELETE
  ========================== */
  const del = async (p) => {
    if (!window.confirm("Are you want to delete this Promotion?")) return;

    await fetch(`${API}/admin/promotions/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id })
    });

    load();
    setSnack("Promotion deleted successfully");
  };

  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Promotions & Offers</Typography>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            setEditing(null);
            setForm(EMPTY_FORM);
            setErrors({});
            setOpen(true);
          }}
        >
          Add Promotion
        </Button>
      </Stack>

      {/* LIST */}
      {items.map((p) => (
        <Card key={p.id} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography fontWeight={600}>{p.title}</Typography>
                <Typography variant="caption">
                  {p.company_name} • {p.promo_code}
                </Typography>
              </Box>

            <Stack direction="row" alignItems="center" spacing={1}>
  <Chip
    label={p.is_active ? "Active" : "Inactive"}
    color={p.is_active ? "success" : "default"}
    size="small"
  />

  <IconButton
    onClick={() => {
      setEditing(p);
      setForm({
        company_name: p.company_name,
        title: p.title,
        description: p.description,
        promo_code: p.promo_code,
        image_url: p.image_url,
        valid_from: p.valid_from,
        valid_till: p.valid_till
      });
      setErrors({});
      setOpen(true);
    }}
  >
    <Edit />
  </IconButton>

  <IconButton onClick={() => toggleStatus(p)}>
    {p.is_active ? <VisibilityOff /> : <Visibility />}
  </IconButton>

  <IconButton color="error" onClick={() => del(p)}>
    <Delete />
  </IconButton>
</Stack>

            </Stack>
          </CardContent>
        </Card>
      ))}

      {/* DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? "Edit Promotion" : "Add Promotion"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            {editing &&
              READ_ONLY_FIELDS.map((key) => (
                <TextField
                  key={key}
                  label={key.toUpperCase()}
                  value={editing[key] ?? ""}
                  disabled
                />
              ))}

            {EDITABLE_FIELDS.map((key) => {
              const isDate = key.includes("valid_");
              const valid =
                form[key] &&
                !errors[key] &&
                isFieldValid(key, form[key], form);

              return (
                <TextField
                  key={key}
                  label={key.replace("_", " ").toUpperCase()}
                  type={isDate ? "date" : "text"}
                  required
                  error={!!errors[key]}
                  color={valid ? "success" : "primary"}
                  helperText={errors[key] || " "}
                  InputLabelProps={isDate ? { shrink: true } : {}}
                  inputProps={
                    isDate
                      ? {
                          min:
                            key === "valid_till"
                              ? form.valid_from || TODAY
                              : TODAY
                        }
                      : {}
                  }
                  value={form[key]}
                  onChange={(e) => {
                    const value = e.target.value;
                    const updatedForm = { ...form, [key]: value };

                    setForm(updatedForm);

                    if (isFieldValid(key, value, updatedForm)) {
                      setErrors({ ...errors, [key]: "" });
                    }
                  }}
                />
              );
            })}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
  variant="contained"
  onClick={save}
  disabled={EDITABLE_FIELDS.some((f) => !form[f])}
>
  {editing ? "Update" : "Save"}
</Button>

        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled">
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
}
