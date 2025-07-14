import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../contexts/auth";

function AdminPrivateComponent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="global-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return user?.role === "admin" || user?.role === "manager" ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
}

export default AdminPrivateComponent;
