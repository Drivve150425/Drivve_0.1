// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Card,
//   CardContent,
//   Stack,
//   Chip,
//   MenuItem,
//   TextField
// } from "@mui/material";

// const API = "http://localhost:8000/api/v1";

// export default function AdminNotifications() {
//   const [logs, setLogs] = useState([]);
//   const [module, setModule] = useState("ALL");

//   const loadLogs = async () => {
//     const url =
//       module === "ALL"
//         ? `${API}/admin/activity-logs`
//         : `${API}/admin/activity-logs?module=${module}`;

//     const res = await fetch(url);
//     setLogs(await res.json());
//   };

//   useEffect(() => {
//     loadLogs();
//   }, [module]);

//   return (
//     <Box p={3}>
//       <Stack direction="row" justifyContent="space-between" mb={3}>
//         <Typography variant="h5">Activity Log</Typography>

//         <TextField
//           select
//           value={module}
//           onChange={e => setModule(e.target.value)}
//           sx={{ minWidth: 200 }}
//         >
//           <MenuItem value="ALL">All Modules</MenuItem>
//           <MenuItem value="FAQ">FAQ</MenuItem>
//           <MenuItem value="ABOUT_US">About Us</MenuItem>
//           <MenuItem value="MATCHING_PREFERENCE">Matching Preference</MenuItem>
//           <MenuItem value="RIDE_REWARD">Ride Reward</MenuItem>
//           <MenuItem value="PROMOTION">Promotion</MenuItem>
//           <MenuItem value="EMERGENCY_CONTACT">Emergency Contact</MenuItem>
//           <MenuItem value="DOCUMENT_VERIFICATION">Document Verification</MenuItem>
//           <MenuItem value="CITY">City</MenuItem>
//           <MenuItem value="STATE">State</MenuItem>
          
//         </TextField>
//       </Stack>

//       {logs.map(log => (
//         <Card key={log.id} sx={{ mb: 2 }}>
//           <CardContent>
//             <Stack direction="row" justifyContent="space-between">
//               <Box>
//                 <Typography fontWeight={600}>{log.description}</Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   {new Date(log.created_at).toLocaleString()}
//                 </Typography>
//               </Box>

//               <Stack direction="row" spacing={1}>
//                 <Chip label={log.module} />
//                 <Chip label={log.action} color="primary" />
//               </Stack>
//             </Stack>
//           </CardContent>
//         </Card>
//       ))}
//     </Box>
//   );
// }
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  MenuItem,
  TextField,
  Divider,
  Pagination
} from "@mui/material";

const API = "http://localhost:8000/api/v1";
const PAGE_SIZE = 6;

/* ======================
   BADGE STYLE HELPERS
====================== */
const actionBadge = (action) => {
  switch (action?.toUpperCase()) {
    case "CREATE":
      return { bg: "#e8f5e9", color: "#2e7d32" };
    case "UPDATE":
      return { bg: "#fff3e0", color: "#ed6c02" };
    case "DELETE":
      return { bg: "#fdecea", color: "#d32f2f" };
    case "ACTIVATE":
      return { bg: "#e8f5e9", color: "#2e7d32" };
    case "DEACTIVATE":
      return { bg: "#eeeeee", color: "#616161" };
    case "STATUS":
    case "STATUS CHANGE":
      return { bg: "#e1f5fe", color: "#0288d1" };
    default:
      return { bg: "#f5f5f5", color: "#424242" };
  }
};

export default function AdminNotifications() {
  const [logs, setLogs] = useState([]);
  const [module, setModule] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  /* ======================
     LOAD LOGS
  ====================== */
  const loadLogs = async () => {
    const url =
      module === "ALL"
        ? `${API}/admin/activity-logs`
        : `${API}/admin/activity-logs?module=${module}`;

    const res = await fetch(url);
    setLogs(await res.json());
  };

  useEffect(() => {
    loadLogs();
  }, [module]);

  /* ======================
     FILTER + SEARCH + ACTION
  ====================== */
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        l.description.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase());

      const matchesModule =
        module === "ALL" || l.module === module;

      const matchesAction =
        actionFilter === "ALL" ||
        l.action.toUpperCase() === actionFilter;

      return matchesSearch && matchesModule && matchesAction;
    });
  }, [logs, search, module, actionFilter]);

  /* ======================
     GROUP BY DATE
  ====================== */
  const groupedLogs = useMemo(() => {
    const groups = {};
    filteredLogs.forEach((log) => {
      const date = new Date(log.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  }, [filteredLogs]);

  /* ======================
     PAGINATION
  ====================== */
  const dates = Object.keys(groupedLogs);
  const totalPages = Math.ceil(dates.length / PAGE_SIZE);
  const pagedDates = dates.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <Box p={3}>
      {/* HEADER */}
      <Stack spacing={2} mb={3}>
        <Typography variant="h5" fontWeight={600}>
         Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Timeline of all admin activities
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search activity…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <TextField
            select
            label="Module"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="ALL">All Modules</MenuItem>
            <MenuItem value="FAQ">FAQ</MenuItem>
            <MenuItem value="PROMOTION">Promotion</MenuItem>
            <MenuItem value="STATE_CITY">City</MenuItem>
            <MenuItem value="STATE_CITY">State</MenuItem>
            <MenuItem value="EMERGENCY_CONTACT">Emergency Contact</MenuItem>
            <MenuItem value="DOCUMENT_VERIFICATION">
              Document Verification
            </MenuItem>
            <MenuItem value="RIDE_REWARD">Ride Reward</MenuItem>
          </TextField>

          {/* ✅ ACTION FILTER */}
          <TextField
            select
            label="Action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="ALL">All Actions</MenuItem>
            <MenuItem value="CREATE">Create</MenuItem>
            <MenuItem value="UPDATE">Update</MenuItem>
            <MenuItem value="DELETE">Delete</MenuItem>
            <MenuItem value="ACTIVATE">Activate</MenuItem>
            <MenuItem value="DEACTIVATE">Deactivate</MenuItem>
            <MenuItem value="STATUS CHANGE">Status Change</MenuItem>
          </TextField>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* EMPTY STATE */}
      {filteredLogs.length === 0 && (
        <Box textAlign="center" py={10} color="text.secondary">
          <Typography variant="h6">No activity found</Typography>
          <Typography variant="body2">
            Try adjusting filters or search
          </Typography>
        </Box>
      )}

      {/* TIMELINE */}
      {pagedDates.map((date) => (
        <Box key={date} mb={4}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            color="text.secondary"
            mb={2}
          >
            {date}
          </Typography>

          <Stack spacing={2} sx={{ borderLeft: "2px solid #e0e0e0", pl: 3 }}>
            {groupedLogs[date].map((log) => {
              const badge = actionBadge(log.action);

              return (
                <Card
                  key={log.id}
                  sx={{
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: -16,
                      top: 24,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: badge.color
                    }
                  }}
                >
                  <CardContent>
                    <Stack spacing={1}>
                      <Typography fontWeight={600}>
                        {log.description}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Box
                          sx={{
                            px: 1,
                            py: 0.3,
                            fontSize: 12,
                            borderRadius: "6px",
                            backgroundColor: "#f4f6f8",
                            color: "#455a64",
                            fontWeight: 500
                          }}
                        >
                          {log.module.replaceAll("_", " ")}
                        </Box>

                        <Box
                          sx={{
                            px: 1,
                            py: 0.3,
                            fontSize: 12,
                            borderRadius: "6px",
                            backgroundColor: badge.bg,
                            color: badge.color,
                            fontWeight: 600
                          }}
                        >
                          {log.action}
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      ))}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Stack alignItems="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
          />
        </Stack>
      )}
    </Box>
  );
}
