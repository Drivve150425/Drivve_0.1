// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Card,
//   CardContent,
//   Stack,
//   IconButton,
//   Switch,
//   FormControlLabel,
//   Chip,
//   Snackbar,
//   Alert
// } from "@mui/material";
// import {
//   Add,
//   Edit,
//   Delete,
//   Visibility,
//   VisibilityOff
// } from "@mui/icons-material";

// const API = "http://localhost:8000/api/v1";

// export default function AdminEmergencyContacts() {
//   /* =====================
//      STATE
//   ===================== */
//   const [items, setItems] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [snack, setSnack] = useState("");

//   const [form, setForm] = useState({
//     contact_name: "",
//     contact_number: "",
//     share_live_location: false
//   });

//   /* =====================
//      LOAD DATA
//   ===================== */
//   const load = async () => {
//     const res = await fetch(`${API}/admin/emergency-contacts`);
//     setItems(await res.json());
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   /* =====================
//      SAVE (CREATE / UPDATE)
//   ===================== */
//   const save = async () => {
//     const url = editing
//       ? `${API}/admin/emergency-contacts/update`
//       : `${API}/admin/emergency-contacts/create`;

//     const payload = editing ? { id: editing.id, ...form } : form;

//     await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     });

//     setOpen(false);
//     setEditing(null);
//     load();
//     setSnack(editing ? "Contact updated successfully" : "Contact created successfully");
//   };

//   /* =====================
//      DELETE (SOFT)
//   ===================== */
//   const del = async (c) => {
//     if (!window.confirm("Delete this emergency contact?")) return;

//     await fetch(`${API}/admin/emergency-contacts/delete`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: c.id })
//     });

//     load();
//     setSnack("Contact deleted");
//   };

//   /* =====================
//      TOGGLE ACTIVE / INACTIVE
//   ===================== */
//   const toggleStatus = async (c) => {
//     await fetch(`${API}/admin/emergency-contacts/status`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         id: c.id,
//         is_active: !c.is_active
//       })
//     });

//     load();
//     setSnack("Status updated");
//   };

//   /* =====================
//      RENDER
//   ===================== */
//   return (
//     <Box p={3}>
//       {/* HEADER */}
//       <Stack direction="row" justifyContent="space-between" mb={3}>
//         <Typography variant="h5">System Emergency Contacts</Typography>
//         <Button
//           startIcon={<Add />}
//           variant="contained"
//           onClick={() => {
//             setEditing(null);
//             setForm({
//               contact_name: "",
//               contact_number: "",
//               share_live_location: false
//             });
//             setOpen(true);
//           }}
//         >
//           Add Contact
//         </Button>
//       </Stack>

//       {/* LIST */}
//       {items.map(c => (
//         <Card key={c.id} sx={{ mb: 2 }}>
//           <CardContent>
//             <Stack direction="row" justifyContent="space-between" alignItems="center">
//               <Box>
//                 <Typography fontWeight={600}>{c.contact_name}</Typography>
//                 <Typography variant="caption">{c.contact_number}</Typography>
//               </Box>

//               <Stack direction="row" spacing={1} alignItems="center">
//                 <Chip
//                   label={c.is_active ? "Active" : "Inactive"}
//                   color={c.is_active ? "success" : "default"}
//                 />

//                 <IconButton onClick={() => toggleStatus(c)}>
//                   {c.is_active ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>

//                 <IconButton
//                   onClick={() => {
//                     setEditing(c);
//                     setForm({
//                       contact_name: c.contact_name,
//                       contact_number: c.contact_number,
//                       share_live_location: c.share_live_location
//                     });
//                     setOpen(true);
//                   }}
//                 >
//                   <Edit />
//                 </IconButton>

//                 <IconButton color="error" onClick={() => del(c)}>
//                   <Delete />
//                 </IconButton>
//               </Stack>
//             </Stack>
//           </CardContent>
//         </Card>
//       ))}

//       {/* ADD / EDIT DIALOG */}
//       <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>
//           {editing ? "Edit Emergency Contact" : "Add Emergency Contact"}
//         </DialogTitle>

//         <DialogContent>
//           <Stack spacing={2} mt={1}>
//             <TextField
//               label="Contact Name"
//               value={form.contact_name}
//               onChange={e =>
//                 setForm({ ...form, contact_name: e.target.value })
//               }
//               fullWidth
//             />

//             <TextField
//               label="Contact Number"
//               value={form.contact_number}
//               onChange={e =>
//                 setForm({ ...form, contact_number: e.target.value })
//               }
//               fullWidth
//             />

//             <FormControlLabel
//               control={
//                 <Switch
//                   checked={form.share_live_location}
//                   onChange={e =>
//                     setForm({
//                       ...form,
//                       share_live_location: e.target.checked
//                     })
//                   }
//                 />
//               }
//               label="Share Live Location"
//             />
//           </Stack>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={() => setOpen(false)}>Cancel</Button>
//           <Button variant="contained" onClick={save}>
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* SUCCESS POPUP */}
//       <Snackbar
//         open={!!snack}
//         autoHideDuration={3000}
//         onClose={() => setSnack("")}
//         anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//       >
//         <Alert severity="success" variant="filled">
//           {snack}
//         </Alert>
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
  Switch,
  FormControlLabel,
  Chip,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";

const API = "http://localhost:8000/api/v1";

/* ==========================
   FIELD CONFIG
========================== */
const EDITABLE_FIELDS = ["contact_name", "contact_number"];

const EMPTY_FORM = {
  contact_name: "",
  contact_number: "",
  share_live_location: false
};

/* ==========================
   FIELD VALIDATION
========================== */
const isFieldValid = (key, value) => {
  if (!value) return false;
  if (key === "contact_number") return value.trim().length >= 6;
  return true;
};

export default function AdminEmergencyContacts() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  /* =====================
     LOAD DATA
  ===================== */
  const load = async () => {
    const res = await fetch(`${API}/admin/emergency-contacts`);
    setItems(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  /* =====================
     VALIDATE
  ===================== */
  const validate = () => {
    const newErrors = {};

    EDITABLE_FIELDS.forEach((field) => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* =====================
     SAVE
  ===================== */
  const save = async () => {
    if (!validate()) {
      setSnack("Please fix validation errors");
      return;
    }

    const url = editing
      ? `${API}/admin/emergency-contacts/update`
      : `${API}/admin/emergency-contacts/create`;

    const payload = editing
      ? { id: editing.id, ...form }
      : form;

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    load();
    setSnack(
      editing
        ? "Emergency contact updated successfully"
        : "Emergency contact created successfully"
    );
  };

  /* =====================
     DELETE
  ===================== */
  const del = async (c) => {
    if (!window.confirm(" Are you want to delete this emergency contact?")) return;

    await fetch(`${API}/admin/emergency-contacts/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id })
    });

    load();
    setSnack(" Emergency contact deleted successfully");
  };

  /* =====================
     STATUS TOGGLE
  ===================== */
  const toggleStatus = async (c) => {
    await fetch(`${API}/admin/emergency-contacts/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: c.id,
        is_active: !c.is_active
      })
    });

    load();
    setSnack(c.is_active ? "Emergency contact deactivated" : "Emergency contact activated");
  };

  /* =====================
     UI
  ===================== */
  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Emergency Contacts</Typography>
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
          Add Emergency Contact
        </Button>
      </Stack>

      {/* LIST */}
      {items.map((c) => (
        <Card key={c.id} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography fontWeight={600}>{c.contact_name}</Typography>
                <Typography variant="caption">{c.contact_number}</Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={c.is_active ? "Active" : "Inactive"}
                  color={c.is_active ? "success" : "default"}
                />

                <IconButton onClick={() => toggleStatus(c)}>
                  {c.is_active ? <VisibilityOff /> : <Visibility />}
                </IconButton>

                <IconButton
                  onClick={() => {
                    setEditing(c);
                    setForm({
                      contact_name: c.contact_name,
                      contact_number: c.contact_number,
                      share_live_location: c.share_live_location
                    });
                    setErrors({});
                    setOpen(true);
                  }}
                >
                  <Edit />
                </IconButton>

                <IconButton color="error" onClick={() => del(c)}>
                  <Delete />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editing ? "Edit Emergency Contact" : "Add Emergency Contact"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Contact Name"
              required
              value={form.contact_name}
              error={!!errors.contact_name}
              helperText={errors.contact_name || " "}
              color={
                form.contact_name && !errors.contact_name
                  ? "success"
                  : "primary"
              }
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, contact_name: value });

                if (isFieldValid("contact_name", value)) {
                  setErrors({ ...errors, contact_name: "" });
                }
              }}
              fullWidth
            />

            <TextField
              label="Contact Number"
              required
              value={form.contact_number}
              error={!!errors.contact_number}
              helperText={errors.contact_number || " "}
              color={
                form.contact_number && !errors.contact_number
                  ? "success"
                  : "primary"
              }
              onChange={(e) => {
                const value = e.target.value;
                setForm({ ...form, contact_number: value });

                if (isFieldValid("contact_number", value)) {
                  setErrors({ ...errors, contact_number: "" });
                }
              }}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.share_live_location}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      share_live_location: e.target.checked
                    })
                  }
                />
              }
              label="Share Live Location"
            />
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
