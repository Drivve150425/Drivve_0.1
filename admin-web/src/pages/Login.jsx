// import React, { useState } from "react";
// import {
//   Box,
//   Button,
//   TextField,
//   Typography,
//   Paper,
//   InputAdornment,
//   IconButton,
// } from "@mui/material";
// import {
//   Person,
//   Lock,
//   Visibility,
//   VisibilityOff,
//   AdminPanelSettings,
// } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";

// export default function Login() {
//   const navigate = useNavigate();

//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   const handleLogin = () => {
//     if (!username || !password) {
//       alert("Please enter username and password");
//       return;
//     }

//     // TEMP login (replace with API later)
//     localStorage.setItem("admin", username);
//     navigate("/admin/dashboard");
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         background: "linear-gradient(135deg, #667eea, #764ba2)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <Paper
//         elevation={12}
//         sx={{
//           width: 380,
//           p: 4,
//           borderRadius: 3,
//           backdropFilter: "blur(10px)",
//         }}
//       >
//         {/* Icon */}
//         <Box display="flex" justifyContent="center" mb={2}>
//           <AdminPanelSettings sx={{ fontSize: 50, color: "#667eea" }} />
//         </Box>

//         <Typography
//           variant="h5"
//           fontWeight="bold"
//           textAlign="center"
//           mb={1}
//         >
//           Admin Login
//         </Typography>

//         <Typography
//           variant="body2"
//           color="text.secondary"
//           textAlign="center"
//           mb={3}
//         >
//           Secure access to admin dashboard
//         </Typography>

//         {/* Username */}
//         <TextField
//           fullWidth
//           label="Username"
//           margin="normal"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Person />
//               </InputAdornment>
//             ),
//           }}
//         />

//         {/* Password */}
//         <TextField
//           fullWidth
//           label="Password"
//           type={showPassword ? "text" : "password"}
//           margin="normal"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Lock />
//               </InputAdornment>
//             ),
//             endAdornment: (
//               <InputAdornment position="end">
//                 <IconButton
//                   onClick={() => setShowPassword(!showPassword)}
//                   edge="end"
//                 >
//                   {showPassword ? <VisibilityOff /> : <Visibility />}
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//         />

//         {/* Login Button */}
//         <Button
//           fullWidth
//           variant="contained"
//           sx={{
//             mt: 3,
//             py: 1.2,
//             fontWeight: "bold",
//             fontSize: "1rem",
//             borderRadius: 2,
//             background:
//               "linear-gradient(135deg, #667eea, #764ba2)",
//             ":hover": {
//               background:
//                 "linear-gradient(135deg, #5a67d8, #6b46c1)",
//             },
//           }}
//           onClick={handleLogin}
//         >
//           Login
//         </Button>

//         {/* Footer */}
//         <Typography
//           variant="caption"
//           color="text.secondary"
//           display="block"
//           textAlign="center"
//           mt={3}
//         >
//           © {new Date().getFullYear()} Admin Panel
//         </Typography>
//       </Paper>
//     </Box>
//   );
// }
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const API_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/v1"
    : "https://your-api-domain.com/api/v1";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!username || !password) {
      setError("Username and password required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const admin = await res.json();

      // ✅ Save admin session
      localStorage.setItem("admin", JSON.stringify(admin));

      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper elevation={12} sx={{ width: 380, p: 4, borderRadius: 3 }}>
        <Box display="flex" justifyContent="center" mb={2}>
          <AdminPanelSettings sx={{ fontSize: 50, color: "#667eea" }} />
        </Box>

        <Typography variant="h5" fontWeight="bold" textAlign="center">
          Admin Login
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Username"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, py: 1.2, fontWeight: "bold" }}
          onClick={handleLogin}
        >
          Login
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="center"
          mt={3}
        >
          © {new Date().getFullYear()} Admin Panel
        </Typography>
      </Paper>
    </Box>
  );
}
