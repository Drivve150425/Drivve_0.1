// import React from "react";
// import { Grid } from "@mui/material";
// import StyledCard from "../Common/StyledCard";
// import LineChart from "./charts/LineChart";
// import PieChart from "./charts/PieChart";
// import BarChart from "./charts/BarChart";

// // Mock data
// const dailyRidesData = [
//   { day: "Mon", rides: 2450 },
//   { day: "Tue", rides: 3200 },
//   { day: "Wed", rides: 2800 },
//   { day: "Thu", rides: 3500 },
//   { day: "Fri", rides: 4200 },
//   { day: "Sat", rides: 3800 },
//   { day: "Sun", rides: 3100 }
// ];

// const cancelRidesData = [
//   { day: "Mon", cancelled: 120 },
//   { day: "Tue", cancelled: 85 },
//   { day: "Wed", cancelled: 150 },
//   { day: "Thu", cancelled: 95 },
//   { day: "Fri", cancelled: 180 },
//   { day: "Sat", cancelled: 110 },
//   { day: "Sun", cancelled: 70 }
// ];

// const userDistributionData = [
//   { name: "Active Users", value: 65, color: "#4caf50" },
//   { name: "Suspended Users", value: 15, color: "#f44336" },
//   { name: "New Users", value: 20, color: "#2196f3" }
// ];

// export default function ChartsSection() {
//   return (
//     <>
//       <Grid container spacing={3} mb={4}>
//         <Grid item xs={12} md={8}>
//           <StyledCard>
//             <LineChart 
//               data={dailyRidesData}
//               title="Daily Rides Overview"
//               dataKey="rides"
//               color="#2196f3"
//             />
//           </StyledCard>
//         </Grid>

//         <Grid item xs={12} md={4}>
//           <StyledCard>
//             <PieChart 
//               data={userDistributionData}
//               title="User Distribution"
//             />
//           </StyledCard>
//         </Grid>
//       </Grid>

//       <Grid container spacing={3}>
//         <Grid item xs={12} md={6}>
//           <StyledCard>
//             <BarChart 
//               data={cancelRidesData}
//               title="Cancelled Rides (Daily)"
//               dataKey="cancelled"
//               color="#f44336"
//             />
//           </StyledCard>
//         </Grid>
//       </Grid>
//     </>
//   );
// }