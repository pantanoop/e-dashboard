import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../contexts/auth";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; // ✅ Named export

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const response = await fetch("http://localhost:5000/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.token) {
        const { user, token } = result;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", JSON.stringify(token));
        setUser(user);
        navigate("/products");
      } else {
        alert("Invalid email or password.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Something went wrong. Please try again.");
    }
  }

  async function handleGoogleLogin(credentialResponse) {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name } = decoded;

      const res = await fetch("http://localhost:5000/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const result = await res.json();

      if (res.ok && result.token) {
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token", JSON.stringify(result.token));
        setUser(result.user);
        navigate("/products");
      } else {
        alert(result.message || "Google sign-in failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google sign-in failed");
    }
  }

  return (
    <div className="login">
      <h1>User Login</h1>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>

      <p>OR</p>

      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => alert("Google Sign-In Failed")}
      />

      <p>
        Admin? <Link to="/org-access">Admin Login</Link>
      </p>
    </div>
  );
}
