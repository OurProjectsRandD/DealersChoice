import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Route } from "react-router-dom";
import UserManagement from "../Pages/AdminPages/UserManagement";
const AdminRoute = ({ children }) => {
  const roles = useSelector((state) => state.auth.roles);
  return roles.includes("Admin") ? <>{children}</> : <Navigate to="/" />;
};
export default AdminRoute;
