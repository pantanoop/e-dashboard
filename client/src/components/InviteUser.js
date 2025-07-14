import React, { useState } from "react";
import { useLoading } from "../contexts/loadingContext"; // ✅ import global loading hook

function InviteUser() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const token = JSON.parse(localStorage.getItem("token"));
  const { showLoading, hideLoading } = useLoading(); // ✅ use global spinner

  async function sendInvite() {
    if (!email || !role) return alert("Email and role are required");

    showLoading(); // ✅ start spinner
    try {
      const res = await fetch("http://localhost:5000/invites/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Invite sent to " + email);
        console.log("🔗 Invite link (also emailed):", data.inviteLink);
        setEmail("");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("❌ Something went wrong while sending invite");
      console.error("Invite error:", err);
    } finally {
      hideLoading(); // ✅ stop spinner
    }
  }

  return (
    <div className="invite-user-form">
      <h2>📨 Invite Admin/Manager</h2>
      <input
        type="email"
        placeholder="Enter email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="admin">Admin</option>
        <option value="manager">Manager</option>
      </select>
      <button onClick={sendInvite}>Send Invite</button>
    </div>
  );
}

export default InviteUser;
