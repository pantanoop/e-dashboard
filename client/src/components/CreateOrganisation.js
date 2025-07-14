import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../contexts/loadingContext"; // ✅ import loading hook

function CreateOrganisation() {
  const [orgData, setOrgData] = useState({
    organisationName: "",
    tenantId: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false); // just for button text

  const { showLoading, hideLoading } = useLoading(); // ✅ global loading spinner
  const token = JSON.parse(localStorage.getItem("token"));
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    showLoading(); // ✅ start global spinner

    try {
      const orgRes = await fetch(
        `${process.env.REACT_APP_API_URL}/organisation/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orgData),
        }
      );

      const orgDataResponse = await orgRes.json();

      if (!orgRes.ok) {
        setError(orgDataResponse.message || "Failed to create organisation");
        return;
      }

      const updateRes = await fetch(
        `${process.env.REACT_APP_API_URL}/organisation/user/update-role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user._id,
            role: "manager",
            tenantId: orgData.tenantId,
          }),
        }
      );

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        setError(updateData.message || "User update failed");
        return;
      }

      const updatedUser = {
        ...user,
        role: "manager",
        tenantId: orgData.tenantId,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("✅ Organisation created and role updated to Manager!");
      navigate("/profile");
    } catch (err) {
      console.error("Error creating org or updating user:", err);
      setError("Something went wrong. Try again.");
    } finally {
      hideLoading(); // ✅ stop spinner
      setSubmitting(false);
    }
  };

  return (
    <div className="create-org-form">
      <h2>🏢 Create New Organisation</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Organisation Name"
          value={orgData.organisationName}
          onChange={(e) =>
            setOrgData({ ...orgData, organisationName: e.target.value })
          }
          required
        />
        <input
          type="text"
          placeholder="Tenant ID (must be unique)"
          value={orgData.tenantId}
          onChange={(e) => setOrgData({ ...orgData, tenantId: e.target.value })}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Organisation"}
        </button>
      </form>
      {error && <p className="error-msg">{error}</p>}
    </div>
  );
}

export default CreateOrganisation;
