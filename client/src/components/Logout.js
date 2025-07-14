import { useContext, useEffect } from "react";
import AuthContext from "../contexts/auth";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);

    navigate("/login");
  }, [setUser, navigate]);

  return null;
}
