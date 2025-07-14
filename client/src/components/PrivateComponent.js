import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../contexts/auth";

function PrivateComponent() {
  const { user } = useContext(AuthContext);

  return user?.role === "user" ? <Outlet /> : <Navigate to="/" />;
}
export default PrivateComponent;
