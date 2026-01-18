// import React, { useEffect, useState } from "react";
// import {
//   Box, Typography, Accordion, AccordionSummary, AccordionDetails,
//   Button, Switch, IconButton, Dialog, DialogTitle,
//   DialogContent, DialogActions, TextField, Stack
// } from "@mui/material";
// import { ExpandMore, Add, Edit, Delete } from "@mui/icons-material";

// const API = "http://localhost:8000/api/v1/admin";

// export default function AdminStateCity() {
//   const [states, setStates] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [mode, setMode] = useState("state");
//   const [form, setForm] = useState({});

//   const load = async () => {
//     const r = await fetch(`${API}/state-city/list`, { method: "POST" });
//     setStates(await r.json());
//   };

//   useEffect(() => { load(); }, []);

//   const save = async () => {
//     const url =
//       mode === "state"
//         ? form.id ? "state/update" : "state/add"
//         : form.id ? "city/update" : "city/add";

//     await fetch(`${API}/${url}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(form)
//     });

//     setOpen(false);
//     load();
//   };

//   return (
//     <Box p={3}>
//       <Typography variant="h5">State & City Management</Typography>

//       <Button startIcon={<Add />} onClick={() => {
//         setMode("state");
//         setForm({ name: "" });
//         setOpen(true);
//       }}>
//         Add State
//       </Button>

//       {states.map(s => (
//         <Accordion key={s.id}>
//           <AccordionSummary expandIcon={<ExpandMore />}>
//             <Typography flex={1}>{s.name}</Typography>

//             <Switch
//               checked={s.active}
//               onChange={() =>
//                 fetch(`${API}/state/update`, {
//                   method: "POST",
//                   headers: { "Content-Type": "application/json" },
//                   body: JSON.stringify({ id: s.id, active: !s.active })
//                 }).then(load)
//               }
//             />

//             <IconButton onClick={() => {
//               setMode("state");
//               setForm({ id: s.id, name: s.name });
//               setOpen(true);
//             }}><Edit /></IconButton>

//             <IconButton color="error" onClick={() =>
//               fetch(`${API}/state/delete`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ id: s.id })
//               }).then(load)
//             }><Delete /></IconButton>
//           </AccordionSummary>

//           <AccordionDetails>
//             <Button onClick={() => {
//               setMode("city");
//               setForm({ name: "", state_id: s.id });
//               setOpen(true);
//             }}>Add City</Button>

//             {s.cities.map(c => (
//               <Stack key={c.id} direction="row" justifyContent="space-between">
//                 <Typography>{c.name}</Typography>

//                 <Stack direction="row">
//                   <Switch
//                     checked={c.active}
//                     onChange={() =>
//                       fetch(`${API}/city/update`, {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({ id: c.id, active: !c.active })
//                       }).then(load)
//                     }
//                   />

//                   <IconButton onClick={() => {
//                     setMode("city");
//                     setForm({ id: c.id, name: c.name });
//                     setOpen(true);
//                   }}><Edit /></IconButton>

//                   <IconButton color="error" onClick={() =>
//                     fetch(`${API}/city/delete`, {
//                       method: "POST",
//                       headers: { "Content-Type": "application/json" },
//                       body: JSON.stringify({ id: c.id })
//                     }).then(load)
//                   }><Delete /></IconButton>
//                 </Stack>
//               </Stack>
//             ))}
//           </AccordionDetails>
//         </Accordion>
//       ))}

//       <Dialog open={open} onClose={() => setOpen(false)}>
//         <DialogTitle>{form.id ? "Edit" : "Add"} {mode}</DialogTitle>
//         <DialogContent>
//           <TextField
//             fullWidth
//             label={mode === "state" ? "State Name" : "City Name"}
//             value={form.name || ""}
//             onChange={e => setForm({ ...form, name: e.target.value })}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpen(false)}>Cancel</Button>
//           <Button variant="contained" onClick={save}>Save</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Snackbar,
  Alert
} from "@mui/material";
import {
  ExpandMore,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";

const API = "http://localhost:8000/api/v1/admin";

/* ==========================
   CONSTANTS
========================== */
const EMPTY_FORM = { name: "" };

/* ==========================
   VALIDATION
========================== */
const isFieldValid = (value) => value && value.trim().length > 0;

export default function AdminStateCity() {
  /* ==========================
     STATE
  ========================== */
  const [states, setStates] = useState([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("state");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  /* ==========================
     HELPERS
  ========================== */
  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  /* ==========================
     LOAD
  ========================== */
  const load = async () => {
    const res = await fetch(`${API}/state-city/list`, { method: "POST" });
    setStates(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  /* ==========================
     STATUS TOGGLE
  ========================== */
  const toggleStateStatus = async (state) => {
    await fetch(`${API}/state/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: state.id, active: !state.active })
    });

    load();
    showSnackbar(
      `State ${state.active ? "deactivated" : "activated"} successfully`
    );
  };

  const toggleCityStatus = async (city) => {
    await fetch(`${API}/city/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: city.id, active: !city.active })
    });

    load();
    showSnackbar(
      `City ${city.active ? "deactivated" : "activated"} successfully`
    );
  };

  /* ==========================
     DELETE
  ========================== */
  const deleteState = async (state) => {
    if (!window.confirm("Are you want to delete this state?")) return;

    await fetch(`${API}/state/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: state.id })
    });

    load();
    showSnackbar("State deleted successfully");
  };

  const deleteCity = async (city) => {
    if (!window.confirm("Are you want to delete this city?")) return;

    await fetch(`${API}/city/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: city.id })
    });

    load();
    showSnackbar("City deleted successfully");
  };

  /* ==========================
     VALIDATE
  ========================== */
  const validate = () => {
    const newErrors = {};
    if (!form.name || !form.name.trim()) {
      newErrors.name = "This field is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ==========================
     SAVE
  ========================== */
  const save = async () => {
    if (!validate()) {
      showSnackbar("Please fix validation errors", "error");
      return;
    }

    const isEdit = Boolean(form.id);

    const url =
      mode === "state"
        ? isEdit ? "state/update" : "state/add"
        : isEdit ? "city/update" : "city/add";

    await fetch(`${API}/${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setOpen(false);
    setForm(EMPTY_FORM);
    setErrors({});
    load();

    showSnackbar(
      `${mode === "state" ? "State" : "City"} ${
        isEdit ? "updated" : "added"
      } successfully`
    );
  };

  /* ==========================
     UI
  ========================== */
  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">State & City Management</Typography>

        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={() => {
            setMode("state");
            setForm(EMPTY_FORM);
            setErrors({});
            setOpen(true);
          }}
        >
          Add State
        </Button>
      </Stack>

      {/* LIST */}
      {states.map((s) => (
        <Accordion key={s.id} sx={{ mb: 2 }}>

          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box flex={1} mr={2}>
              <Typography
                sx={{
                  textDecoration: !s.active ? "line-through" : "none",
                  color: !s.active ? "text.disabled" : "text.primary"
                }}
              >
                {s.name}
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip
                label={s.active ? "Active" : "Inactive"}
                color={s.active ? "success" : "default"}
                size="small"
              />

              <IconButton onClick={() => toggleStateStatus(s)}>
                {s.active ? <VisibilityOff /> : <Visibility />}
              </IconButton>

              <IconButton
                onClick={() => {
                  setMode("state");
                  setForm({ id: s.id, name: s.name });
                  setErrors({});
                  setOpen(true);
                }}
              >
                <Edit />
              </IconButton>

              <IconButton color="error" onClick={() => deleteState(s)}>
                <Delete />
              </IconButton>
            </Stack>
          </AccordionSummary>

          <AccordionDetails>
            <Button
              startIcon={<Add />}
              sx={{ mb: 1 }}
              onClick={() => {
                setMode("city");
                setForm({ ...EMPTY_FORM, state_id: s.id });
                setErrors({});
                setOpen(true);
              }}
            >
              Add City
            </Button>

            {s.cities.map((c) => (
              <Stack
                key={c.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Box flex={1} mr={2}>
                  <Typography
                    sx={{
                      textDecoration: !c.active ? "line-through" : "none",
                      color: !c.active ? "text.disabled" : "text.primary"
                    }}
                  >
                    {c.name}
                  </Typography>
                </Box>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip
                    label={c.active ? "Active" : "Inactive"}
                    color={c.active ? "success" : "default"}
                    size="small"
                  />

                  <IconButton onClick={() => toggleCityStatus(c)}>
                    {c.active ? <VisibilityOff /> : <Visibility />}
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      setMode("city");
                      setForm({ id: c.id, name: c.name });
                      setErrors({});
                      setOpen(true);
                    }}
                  >
                    <Edit />
                  </IconButton>

                  <IconButton color="error" onClick={() => deleteCity(c)}>
                    <Delete />
                  </IconButton>
                </Stack>
              </Stack>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {form.id ? "Edit" : "Add"} {mode === "state" ? "State" : "City"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            required
            placeholder={
              mode === "state"
                ? "Enter state name"
                : "Enter city name"
            }
            value={form.name || ""}
            error={!!errors.name}
            helperText={errors.name || " "}
            color={form.name && !errors.name ? "success" : "primary"}
            InputLabelProps={{ shrink: false }}
            onChange={(e) => {
              const value = e.target.value;
              setForm({ ...form, name: value });

              if (isFieldValid(value)) {
                setErrors({ ...errors, name: "" });
              }
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
  variant="contained"
  onClick={save}
  disabled={!form.name}
>
  {form.id ? "Update" : "Save"}
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
