import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WardProvider } from "./Home/Context/WardContext";
import Navbar from "./Home/Nav/Navbar";
import Login from "./Home/Auth/Login";
import RoleSelection from "./Home/Auth/RoleSelection";
import Register from "./Home/Auth/Register";
import Forget from "./Home/Auth/Forget";
import ResetPassword from "./Home/Auth/ResetPassword";
import About from "./Home/Pages/About";
import Documents from "./Home/Pages/Documents";
import ProfileSection from "./Home/Pages/ProfileSection";
import Settings from "./Home/Pages/Settings";
import HelpSupport from "./Home/Pages/HelpSupport";
import Contact from "./Home/Pages/Contact";
import Assets from "./Home/Pages/Assets";
import Activities from "./Home/Pages/Activities";
import Works from "./Home/Pages/Works";
import Notices from "./Home/Pages/Notices";
import Departments from "./Home/Pages/Departments";
import ProtectedRoute from "./Home/utils/ProtectedRoute";
import AdminRoutes from "./Admin/AdminRoutes";
import OfficerRoutes from "./Officer/OfficerRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Simple wrapper for pages that need navbar
const PageWithNavbar = ({ children }) => {
  return (
    <>
      <Navbar showHomeContent={false} />
      <div style={{ marginTop: "0", paddingTop: "0" }}>{children}</div>
    </>
  );
};

function App() {
  return (
    <WardProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navbar showHomeContent={true} />} />
          <Route path="/about" element={<About />} />
          <Route path="/documents" element={<Documents />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageWithNavbar>
                  <ProfileSection />
                </PageWithNavbar>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <PageWithNavbar>
                  <Settings />
                </PageWithNavbar>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RoleSelection />} />
          <Route
            path="/register/citizen"
            element={<Register initialRole="citizen" hideRoleSelector={true} />}
          />
          <Route
            path="/register/officer"
            element={<Register initialRole="officer" hideRoleSelector={true} />}
          />
          <Route path="/forgot-password" element={<Forget />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/works" element={<Works />} />
          <Route path="/notices" element={<Notices />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/contact" element={<Contact />} />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminRoutes />
              </ProtectedRoute>
            }
          />

          {/* Officer Routes */}
          <Route
            path="/officer/*"
            element={
              <ProtectedRoute requiredRole="officer">
                <OfficerRoutes />
              </ProtectedRoute>
            }
          />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </WardProvider>
  );
}

export default App;
