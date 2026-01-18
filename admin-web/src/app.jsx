import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/admin/Dashboard";
import Home from "./pages/admin/Home";
import Cities from "./pages/admin/Cities";
import States from "./pages/admin/States";
import Documents from "./pages/admin/Documents";
import Matching from "./pages/admin/Matching";
import Emergency from "./pages/admin/Emergency";
import Rewards from "./pages/admin/Rewards";
import Promotions from "./pages/admin/Promotions";
import HelpSupport from "./pages/admin/HelpSupport";
import AboutUs from "./pages/admin/AboutUs";
import Feedback from "./pages/admin/Feedback";
import Notification from "./pages/admin/Notification";

export default function App() {
  localStorage.setItem("admin", "Admin");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Dashboard />}>
          <Route index element={<Home />} />
          <Route path="cities" element={<Cities />} />
          <Route path="states" element={<States />} />
          <Route path="documents" element={<Documents />} />
          <Route path="matching" element={<Matching />} />
          <Route path="emergency" element={<Emergency />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="help" element={<HelpSupport />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="notifications" element={<Notification />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
