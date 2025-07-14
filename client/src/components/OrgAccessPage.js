import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/auth";
import { useLoading } from "../contexts/loadingContext"; // ✅ global loading

function OrgAccessPage() {
  const [organisationName, setOrganisationName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { showLoading, hideLoading } = useLoading(); // ✅ use global spinner

  async function handleAdminLogin() {
    setError("");

    if (!organisationName || !tenantId || !email || !password) {
      setError("All fields are required.");
      return;
    }

    showLoading(); // ✅ spinner ON
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        setError(data.result || "Invalid login");
        return;
      }

      const user = data.user;

      if (
        (user.role !== "admin" && user.role !== "manager") ||
        user.tenantId !== tenantId
      ) {
        setError("Invalid admin credentials or mismatched tenant.");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", JSON.stringify(data.token));
      localStorage.setItem("tenantId", tenantId);
      localStorage.setItem("organisationName", organisationName);
      setUser(user);
      navigate("/products");
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Server error. Try again.");
    } finally {
      hideLoading(); // ✅ spinner OFF
    }
  }

  return (
    <div className="login">
      <h2>Admin Login</h2>

      <input
        type="text"
        placeholder="Organisation Name"
        value={organisationName}
        onChange={(e) => setOrganisationName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Tenant ID"
        value={tenantId}
        onChange={(e) => setTenantId(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Admin Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        placeholder="Admin Password"
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button onClick={handleAdminLogin}>Admin Login</button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      <p>
        User? Go to <Link to="/login">User Login</Link>
      </p>
    </div>
  );
}

export default OrgAccessPage;
