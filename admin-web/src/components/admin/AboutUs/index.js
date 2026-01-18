// import React, { useEffect, useState } from "react";
// import {
//   Box, Typography, Button, TextField,
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Stack, Snackbar, Alert, Card, CardContent, IconButton, Chip
// } from "@mui/material";
// import { Add, Edit, Visibility, VisibilityOff, Delete } from "@mui/icons-material";

// const API = "http://localhost:8000/api/v1";

// export default function AdminAboutUs() {
//   const [items, setItems] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState(null);

//   const [snackbar, setSnackbar] = useState({ open: false, message: "" });

//   const [form, setForm] = useState({ title: "", content: "" });

//   const loadData = async () => {
//     const res = await fetch(`${API}/admin/about-us`);
//     setItems(await res.json());
//   };

//   useEffect(() => { loadData(); }, []);

//   const show = (msg) => setSnackbar({ open: true, message: msg });

//   const openAdd = () => {
//     setEditing(null);
//     setForm({ title: "", content: "" });
//     setOpen(true);
//   };

//   const openEdit = (item) => {
//     setEditing(item);
//     setForm({ title: item.title, content: item.content });
//     setOpen(true);
//   };

//   const save = async () => {
//     const url = editing
//       ? `${API}/admin/about-us/update`
//       : `${API}/admin/about-us/create`;

//     const payload = editing ? { id: editing.id, ...form } : form;

//     await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     });

//     setOpen(false);
//     loadData();
//     show(editing ? "About Us updated successfully" : "About Us created successfully");
//   };

//   const toggleStatus = async (item) => {
//     await fetch(`${API}/admin/about-us/status`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: item.id, is_active: !item.is_active })
//     });
//     loadData();
//     show(item.is_active ? "Deactivated" : "Activated");
//   };

//   const deleteItem = async (item) => {
//     if (!window.confirm("Delete this content?")) return;

//     await fetch(`${API}/admin/about-us/delete`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: item.id })
//     });
//     loadData();
//     show("Deleted successfully");
//   };

//   return (
//     <Box p={3}>
//       <Stack direction="row" justifyContent="space-between" mb={3}>
//         <Typography variant="h5">About Us Management</Typography>
//         <Button startIcon={<Add />} variant="contained" onClick={openAdd}>
//           Add Content
//         </Button>
//       </Stack>

//       {items.map(item => (
//         <Card key={item.id} sx={{ mb: 2 }}>
//           <CardContent>
//             <Stack direction="row" justifyContent="space-between">
//               <Box>
//                 <Typography fontWeight={600}>{item.title}</Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {item.content.substring(0, 150)}...
//                 </Typography>
//               </Box>

//               <Stack direction="row" spacing={1}>
//                 <Chip
//                   label={item.is_active ? "Active" : "Inactive"}
//                   color={item.is_active ? "success" : "default"}
//                 />
//                 <IconButton onClick={() => openEdit(item)}><Edit /></IconButton>
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

//       <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>{editing ? "Edit About Us" : "Add About Us"}</DialogTitle>
//         <DialogContent>
//           <Stack spacing={2} mt={1}>
//             <TextField
//               label="Title"
//               value={form.title}
//               onChange={e => setForm({ ...form, title: e.target.value })}
//             />
//             <TextField
//               label="Content"
//               multiline
//               rows={6}
//               value={form.content}
//               onChange={e => setForm({ ...form, content: e.target.value })}
//             />
//           </Stack>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpen(false)}>Cancel</Button>
//           <Button variant="contained" onClick={save}>
//             {editing ? "Update" : "Create"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() => setSnackbar({ open: false, message: "" })}
//       >
//         <Alert severity="success" variant="filled">
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }
// import React, { useEffect, useState } from "react";
// import {
//   Box, Typography, Button, TextField,
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Stack, Snackbar, Alert, Card, CardContent,
//   IconButton, Chip
// } from "@mui/material";

// import {
//   Add, Edit, Visibility, VisibilityOff, Delete
// } from "@mui/icons-material";

// import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

// import {
//   DndContext,
//   closestCenter
// } from "@dnd-kit/core";

// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   useSortable
// } from "@dnd-kit/sortable";

// import { CSS } from "@dnd-kit/utilities";

// const API = "http://localhost:8000/api/v1";

// /* ===============================
//    SORTABLE CARD
// ================================ */
// function SortableCard({ item, children }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition
//   } = useSortable({ id: item.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition
//   };

//   return (
//     <div ref={setNodeRef} style={style}>
//       <Card sx={{ mb: 2 }}>
//         <CardContent>
//           <Stack direction="row" justifyContent="space-between" alignItems="center">
//             <Stack direction="row" spacing={1} alignItems="center">
//               <IconButton {...attributes} {...listeners} sx={{ cursor: "grab" }}>
//                 <DragIndicatorIcon />
//               </IconButton>
//               {children}
//             </Stack>
//           </Stack>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// /* ===============================
//    MAIN COMPONENT
// ================================ */
// export default function AdminAboutUs() {
//   const [items, setItems] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [editing, setEditing] = useState(null);

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: ""
//   });

//   const [form, setForm] = useState({
//     title: "",
//     content: ""
//   });

//   /* ===============================
//      LOAD DATA (SORTED)
//   ================================ */
//   const loadData = async () => {
//     const res = await fetch(`${API}/admin/about-us`);
//     const data = await res.json();
//     setItems(data); // backend should return ORDER BY sort_order
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const show = (msg) =>
//     setSnackbar({ open: true, message: msg });

//   /* ===============================
//      ADD / EDIT
//   ================================ */
//   const openAdd = () => {
//     setEditing(null);
//     setForm({ title: "", content: "" });
//     setOpen(true);
//   };

//   const openEdit = (item) => {
//     setEditing(item);
//     setForm({
//       title: item.title,
//       content: item.content
//     });
//     setOpen(true);
//   };

//   const save = async () => {
//     const url = editing
//       ? `${API}/admin/about-us/update`
//       : `${API}/admin/about-us/create`;

//     const payload = editing
//       ? { id: editing.id, ...form }
//       : form;

//     await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload)
//     });

//     setOpen(false);
//     loadData();
//     show(editing ? "Updated successfully" : "Created successfully");
//   };

//   /* ===============================
//      STATUS TOGGLE
//   ================================ */
//   const toggleStatus = async (item) => {
//     await fetch(`${API}/admin/about-us/status`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         id: item.id,
//         is_active: !item.is_active
//       })
//     });
//     loadData();
//     show(item.is_active ? "Deactivated" : "Activated");
//   };

//   /* ===============================
//      DELETE
//   ================================ */
//   const deleteItem = async (item) => {
//     if (!window.confirm("Delete this content?")) return;

//     await fetch(`${API}/admin/about-us/delete`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id: item.id })
//     });

//     loadData();
//     show("Deleted successfully");
//   };

//   /* ===============================
//      DRAG & DROP HANDLER
//   ================================ */
//   const handleDragEnd = async (event) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const oldIndex = items.findIndex(i => i.id === active.id);
//     const newIndex = items.findIndex(i => i.id === over.id);

//     const updated = [...items];
//     const [moved] = updated.splice(oldIndex, 1);
//     updated.splice(newIndex, 0, moved);

//     setItems(updated);

//     // persist order
//     await fetch(`${API}/admin/about-us/reorder`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(
//         updated.map((item, index) => ({
//           id: item.id,
//           sort_order: index
//         }))
//       )
//     });

//     show("Order saved");
//   };

//   /* ===============================
//      UI
//   ================================ */
//   return (
//     <Box p={3}>
//       <Stack direction="row" justifyContent="space-between" mb={3}>
//         <Typography variant="h5">About Us Management</Typography>
//         <Button startIcon={<Add />} variant="contained" onClick={openAdd}>
//           Add Content
//         </Button>
//       </Stack>

//       <DndContext
//         collisionDetection={closestCenter}
//         onDragEnd={handleDragEnd}
//       >
//         <SortableContext
//           items={items.map(i => i.id)}
//           strategy={verticalListSortingStrategy}
//         >
//           {items.map(item => (
//             <SortableCard key={item.id} item={item}>
//               <Box sx={{ minWidth: 300 }}>
//                 <Typography fontWeight={600}>
//                   {item.title}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {item.content.substring(0, 150)}...
//                 </Typography>
//               </Box>

//               <Stack direction="row" spacing={1}>
//                 <Chip
//                   label={item.is_active ? "Active" : "Inactive"}
//                   color={item.is_active ? "success" : "default"}
//                 />
//                 <IconButton onClick={() => openEdit(item)}>
//                   <Edit />
//                 </IconButton>
//                 <IconButton onClick={() => toggleStatus(item)}>
//                   {item.is_active ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>
//                 <IconButton color="error" onClick={() => deleteItem(item)}>
//                   <Delete />
//                 </IconButton>
//               </Stack>
//             </SortableCard>
//           ))}
//         </SortableContext>
//       </DndContext>

//       {/* ADD / EDIT DIALOG */}
//       <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle>
//           {editing ? "Edit About Us" : "Add About Us"}
//         </DialogTitle>
//         <DialogContent>
//           <Stack spacing={2} mt={1}>
//             <TextField
//               label="Title"
//               value={form.title}
//               onChange={e =>
//                 setForm({ ...form, title: e.target.value })
//               }
//             />
//             <TextField
//               label="Content"
//               multiline
//               rows={6}
//               value={form.content}
//               onChange={e =>
//                 setForm({ ...form, content: e.target.value })
//               }
//             />
//           </Stack>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpen(false)}>Cancel</Button>
//           <Button variant="contained" onClick={save}>
//             {editing ? "Update" : "Create"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* SNACKBAR */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={() =>
//           setSnackbar({ open: false, message: "" })
//         }
//       >
//         <Alert severity="success" variant="filled">
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Snackbar, Alert, Card, CardContent,
  IconButton, Chip
} from "@mui/material";

import {
  Add, Edit, Visibility, VisibilityOff, Delete
} from "@mui/icons-material";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const API = "http://localhost:8000/api/v1";

/* ===============================
   SORTABLE CARD
================================ */
function SortableCard({ item, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton {...attributes} {...listeners} sx={{ cursor: "grab" }}>
                <DragIndicatorIcon />
              </IconButton>
              {children}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}

/* ===============================
   MAIN COMPONENT
================================ */
export default function AdminAboutUs() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [form, setForm] = useState({
    title: "",
    content: ""
  });
  const EDITABLE_FIELDS = ["title", "content"];

  const EMPTY_FORM = {
    title: "",
    content: ""
  };
  const isFieldValid = (key, value) => {
    if (!value) return false;
    if (key === "title") return value.trim().length >= 3;
    if (key === "content") return value.trim().length >= 10;
    return true;
  };
  

  const [errors, setErrors] = useState({});

  /* ===============================
     LOAD DATA
  ================================ */
  const loadData = async () => {
    const res = await fetch(`${API}/admin/about-us`);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const show = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  /* ===============================
     VALIDATION
  ================================ */
 const validate = () => {
  const newErrors = {};

  EDITABLE_FIELDS.forEach((field) => {
    if (!form[field] || !form[field].trim()) {
      newErrors[field] = "This field is required";
    }
  });

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


  /* ===============================
     ADD / EDIT
  ================================ */
  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", content: "" });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, content: item.content });
    setErrors({});
    setOpen(true);
  };

  const save = async () => {
    if (!validate()) return;

    try {
      const url = editing
        ? `${API}/admin/about-us/update`
        : `${API}/admin/about-us/create`;

      const payload = editing
        ? { id: editing.id, ...form }
        : form;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Server error");

      setOpen(false);
      loadData();
      show(editing ? "About us updated successfully" : "About us created successfully");
    } catch {
      show("Something went wrong", "error");
    }
  };

  /* ===============================
     STATUS TOGGLE
  ================================ */
  const toggleStatus = async (item) => {
    await fetch(`${API}/admin/about-us/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        is_active: !item.is_active
      })
    });
    loadData();
    show(item.is_active ? "About Us Deactivated" : "About Us Activated");
  };

  /* ===============================
     DELETE
  ================================ */
  const deleteItem = async (item) => {
    if (!window.confirm("Are you want to delete this about us?")) return;

    await fetch(`${API}/admin/about-us/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id })
    });

    loadData();
    show("About us deleted successfully");
  };

  /* ===============================
     DRAG & DROP
  ================================ */
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);

    const updated = [...items];
    const [moved] = updated.splice(oldIndex, 1);
    updated.splice(newIndex, 0, moved);

    setItems(updated);

    try {
      await fetch(`${API}/admin/about-us/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          updated.map((item, index) => ({
            id: item.id,
            sort_order: index
          }))
        )
      });
      show("Order saved");
    } catch {
      show("Failed to save order", "error");
    }
  };

  /* ===============================
     UI
  ================================ */
  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="h5">About Us</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={openAdd}>
          Add About Us
        </Button>
      </Stack>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map(item => (
            <SortableCard key={item.id} item={item}>
              <Box sx={{ minWidth: 300 }}>
                <Typography fontWeight={600}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.content.substring(0, 150)}...
                </Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Chip
                  label={item.is_active ? "Active" : "Inactive"}
                  color={item.is_active ? "success" : "default"}
                />
                <IconButton onClick={() => openEdit(item)}><Edit /></IconButton>
                <IconButton onClick={() => toggleStatus(item)}>
                  {item.is_active ? <VisibilityOff /> : <Visibility />}
                </IconButton>
                <IconButton color="error" onClick={() => deleteItem(item)}>
                  <Delete />
                </IconButton>
              </Stack>
            </SortableCard>
          ))}
        </SortableContext>
      </DndContext>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit About Us" : "Add About Us"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
           <TextField
  label="Title"
  required
  value={form.title}
  error={!!errors.title}
  helperText={errors.title || " "}
  color={
    form.title && !errors.title ? "success" : "primary"
  }
  onChange={(e) => {
    const value = e.target.value;
    setForm({ ...form, title: value });

    if (isFieldValid("title", value)) {
      setErrors({ ...errors, title: "" });
    }
  }}
/>

<TextField
  label="Content"
  required
  multiline
  rows={6}
  value={form.content}
  error={!!errors.content}
  helperText={errors.content || " "}
  color={
    form.content && !errors.content ? "success" : "primary"
  }
  onChange={(e) => {
    const value = e.target.value;
    setForm({ ...form, content: value });

    if (isFieldValid("content", value)) {
      setErrors({ ...errors, content: "" });
    }
  }}
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
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
