import { useParams } from "react-router-dom";
import React, { useState } from "react";
import { useLoading } from "../contexts/loadingContext";

function AcceptInvite() {
  const { token: inviteToken } = useParams();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const { showLoading, hideLoading } = useLoading(); // ✅ use correct methods

  async function acceptInvite() {
    const authToken = JSON.parse(localStorage.getItem("token"));
    showLoading(); 

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/invites/accept-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token: inviteToken,
            name,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("✅ Account created successfully! You can now log in.");
        setName("");
        setPassword("");
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      alert("❌ Failed to connect to server.");
    } finally {
      hideLoading(); // ✅ hide global spinner
    }
  }

  return (
    <div className="invite-form">
      <h2>Join Organisation</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="password"
        placeholder="Set Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={acceptInvite}>Join</button>
    </div>
  );
}

export default AcceptInvite;
