// import React, { useEffect, useState } from "react";
// import {
//   Box, Typography, Button, TextField,
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Card, CardContent, Stack, IconButton,
//   Chip, Snackbar, Alert
// } from "@mui/material";
// import {
//   Add, Edit, Visibility, VisibilityOff, Delete
// } from "@mui/icons-material";

// const API = "http://localhost:8000/api/v1";
// const EDITABLE_FIELDS = [
//   "title",
//   "rides_required",
//   "reward_points"
// ];

// const EMPTY_FORM = {
//   title: "",
//   rides_required: "",
//   reward_points: ""
// };

// /* ==========================
//    FIELD VALIDATION
// ========================== */
// const isFieldValid = (key, value) => {
//   if (!value) return false;

//   if (key !== "title" && Number(value) <= 0) return false;

//   return true;
// };
// export default function AdminRideRewards() {
//   const [items, setItems] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [snack, setSnack] = useState("");

//   const [form, setForm] = useState({
//     title: "",
//     rides_required: "",
//     reward_points: ""
//   });

//   const load = async () => {
//     const res = await fetch(`${API}/admin/ride-rewards`);
//     setItems(await res.json());
//   };

//   useEffect(() => { load(); }, []);

//   const save = async () => {
//     const url = editing
//       ? `${API}/admin/ride-rewards/update`
//       : `${API}/admin/ride-rewards/create`;

//     const payload = editing ? { id: editing.id, ...form } : form;

//     await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     });

//     setOpen(false);
//     load();
//     setSnack(editing ? "Reward updated successfully" : "Reward created successfully");
//   };

//   const toggleStatus = async (r) => {
//     await fetch(`${API}/admin/ride-rewards/status`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: r.id, is_active: !r.is_active })
//     });
//     load();
//     setSnack(`Reward ${r.is_active ? "deactivated" : "activated"}`);
//   };

//   const del = async (r) => {
//     if (!window.confirm("Are you want to delete this reward?")) return;

//     await fetch(`${API}/admin/ride-rewards/delete`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: r.id })
//     });
//     load();
//     setSnack("Reward deleted successfully");
//   };

//   return (
//     <Box p={3}>
//       <Stack direction="row" justifyContent="space-between" mb={3}>
//         <Typography variant="h5">Rewards</Typography>
//         <Button
//           startIcon={<Add />}
//           variant="contained"
//           onClick={() => {
//             setEditing(null);
//             setForm({ title: "", rides_required: "", reward_points: "" });
//             setOpen(true);
//           }}
//         >
//           Add Reward
//         </Button>
//       </Stack>

//       {items.map(r => (
//         <Card key={r.id} sx={{ mb: 2 }}>
//           <CardContent>
//             <Stack direction="row" justifyContent="space-between">
//               <Box>
//                 <Typography fontWeight={600}>{r.title}</Typography>
//                 <Typography variant="caption">
//                   {r.rides_required} rides → {r.reward_points} points
//                 </Typography>
//               </Box>

//               <Stack direction="row" spacing={1}>
//                 <Chip
//                   label={r.is_active ? "Active" : "Inactive"}
//                   color={r.is_active ? "success" : "default"}
//                 />
//                 <IconButton onClick={() => {
//                   setEditing(r);
//                   setForm(r);
//                   setOpen(true);
//                 }}>
//                   <Edit />
//                 </IconButton>
//                 <IconButton onClick={() => toggleStatus(r)}>
//                   {r.is_active ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>
//                 <IconButton color="error" onClick={() => del(r)}>
//                   <Delete />
//                 </IconButton>
//               </Stack>
//             </Stack>
//           </CardContent>
//         </Card>
//       ))}

//       <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>{editing ? "Edit Reward" : "Add Reward"}</DialogTitle>
//         <DialogContent>
//           <Stack spacing={2} mt={1}>
//             <TextField
//               label="Title"
//               value={form.title}
//               onChange={e => setForm({ ...form, title: e.target.value })}
//             />
//             <TextField
//               label="Rides Required"
//               type="number"
//               value={form.rides_required}
//               onChange={e => setForm({ ...form, rides_required: e.target.value })}
//             />
//             <TextField
//               label="Reward Points"
//               type="number"
//               value={form.reward_points}
//               onChange={e => setForm({ ...form, reward_points: e.target.value })}
//             />
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
  Box, Typography, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, Stack, IconButton,
  Chip, Snackbar, Alert
} from "@mui/material";
import {
  Add, Edit, Visibility, VisibilityOff, Delete
} from "@mui/icons-material";

const API = "http://localhost:8000/api/v1";

/* ==========================
   FIELD CONFIG
========================== */
const EDITABLE_FIELDS = [
  "title",
  "rides_required",
  "reward_points"
];

const EMPTY_FORM = {
  title: "",
  rides_required: "",
  reward_points: ""
};

/* ==========================
   FIELD VALIDATION
========================== */
const isFieldValid = (key, value) => {
  if (!value) return false;

  if (key !== "title" && Number(value) <= 0) return false;

  return true;
};

export default function AdminRideRewards() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [snack, setSnack] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  /* ==========================
     LOAD
  ========================== */
  const load = async () => {
    const res = await fetch(`${API}/admin/ride-rewards`);
    setItems(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  /* ==========================
     VALIDATE
  ========================== */
  const validate = () => {
    const newErrors = {};

    EDITABLE_FIELDS.forEach((field) => {
      if (!form[field]) {
        newErrors[field] = "This field is required";
      } else if (
        field !== "title" &&
        Number(form[field]) <= 0
      ) {
        newErrors[field] = "Must be greater than 0";
      }
    });

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
      ? `${API}/admin/ride-rewards/update`
      : `${API}/admin/ride-rewards/create`;

    const payload = editing
      ? { id: editing.id, ...form }
      : form;

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setOpen(false);
    setForm(EMPTY_FORM);
    setEditing(null);
    load();
    setSnack(editing ? "Reward updated successfully" : "Reward created successfully");
  };

  /* ==========================
     STATUS
  ========================== */
  const toggleStatus = async (r) => {
    await fetch(`${API}/admin/ride-rewards/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, is_active: !r.is_active })
    });
    load();
    setSnack(`Reward ${r.is_active ? "deactivated" : "activated"}`);
  };

  /* ==========================
     DELETE
  ========================== */
  const del = async (r) => {
    if (!window.confirm("Are you want to delete this reward?")) return;

    await fetch(`${API}/admin/ride-rewards/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id })
    });
    load();
    setSnack("Reward deleted successfully");
  };

  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Rewards</Typography>
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
          Add Reward
        </Button>
      </Stack>

      {/* LIST */}
      {items.map(r => (
        <Card key={r.id} sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography fontWeight={600}>{r.title}</Typography>
                <Typography variant="caption">
                  {r.rides_required} rides → {r.reward_points} points
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Chip
                  label={r.is_active ? "Active" : "Inactive"}
                  color={r.is_active ? "success" : "default"}
                />
                <IconButton onClick={() => {
                  setEditing(r);
                  setForm({
                    title: r.title,
                    rides_required: r.rides_required,
                    reward_points: r.reward_points
                  });
                  setErrors({});
                  setOpen(true);
                }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => toggleStatus(r)}>
                  {r.is_active ? <VisibilityOff /> : <Visibility />}
                </IconButton>
                <IconButton color="error" onClick={() => del(r)}>
                  <Delete />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}

      {/* DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Reward" : "Add Reward"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {EDITABLE_FIELDS.map((key) => {
              const valid =
                form[key] &&
                !errors[key] &&
                isFieldValid(key, form[key]);

              return (
                <TextField
                  key={key}
                  label={key.replace("_", " ").toUpperCase()}
                  type={key === "title" ? "text" : "number"}
                  required
                  value={form[key]}
                  error={!!errors[key]}
                  helperText={errors[key] || " "}
                  color={valid ? "success" : "primary"}
                  onChange={(e) => {
                    const value = e.target.value;
                    const updatedForm = { ...form, [key]: value };
                    setForm(updatedForm);

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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
  variant="contained"
  onClick={save}
  disabled={EDITABLE_FIELDS.some(f => !form[f])}
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
