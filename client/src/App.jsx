import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Users from "./pages/Users";
import Companies from "./pages/Companies";
import CompanyForm from "./pages/CompanyForm";
import Profile from "./pages/Profile";
import Serviceies from "./pages/Serviceies";
import Category from "./pages/Category";
import SubCategory from "./pages/SubCategory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />}/>
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element = {
          <ProtectedRoute  roles={[
                "SUPER_ADMIN",
                "SUB_ADMIN"
              ]}>
                <Dashboard /> 
          </ProtectedRoute>
        } />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "SUB_ADMIN"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* USERS */}
        <Route
          path="/users"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "SUB_ADMIN"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "SUB_ADMIN"]}>
              <Companies />
            </ProtectedRoute>
          }
        />
         <Route
          path="/companies/add"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "SUB_ADMIN"]}>
              <CompanyForm />
            </ProtectedRoute>
          }
        />
      <Route
          path="/companies/edit/:id"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "SUB_ADMIN"]}>
              <CompanyForm />
            </ProtectedRoute>
          }
        />

         <Route
          path="/services"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "SUB_ADMIN"]}>
              <Serviceies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "SUB_ADMIN"]}>
              <Category />
            </ProtectedRoute>
          }
        />
         <Route
          path="/sub-category"
          element={
            <ProtectedRoute roles={["SUPER_ADMIN", "SUB_ADMIN"]}>
              <SubCategory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;