import { useEffect, useState, useContext } from "react";
import AuthContext from "../contexts/auth";
import { useLoading } from "../contexts/loadingContext"; 
import { Link } from "react-router-dom";

function ManageAdmin() {
  const { user } = useContext(AuthContext);
  const token = JSON.parse(localStorage.getItem("token"));
  const { showLoading, hideLoading } = useLoading(); 

  const [admins, setAdmins] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user?.role === "manager") fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchAdmins() {
    showLoading(); 
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const adminsOnly = data.filter((u) => u.role === "admin");
      setAdmins(adminsOnly);
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      hideLoading(); 
    }
  }

  async function handlePromote(userId) {
    showLoading();
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/promote/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("✅ Promoted to manager!");
        fetchAdmins();
      } else {
        alert(data.message || "Promotion failed");
      }
    } catch (err) {
      console.error("Promote error:", err);
    } finally {
      hideLoading();
    }
  }

  async function handleDelete(userId) {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    showLoading();
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/delete/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("🗑️ Admin deleted.");
        fetchAdmins();
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      hideLoading();
    }
  }

  async function handleAddAdmin(e) {
    e.preventDefault();
    showLoading();
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/admin/add-admin`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAdmin),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Admin added!");
        setNewAdmin({ name: "", email: "", password: "" });
        setShowAddForm(false);
        fetchAdmins();
      } else {
        alert(data.message || "Add admin failed");
      }
    } catch (err) {
      console.error("Add admin error:", err);
    } finally {
      hideLoading();
    }
  }

  const filteredAdmins = admins.filter((admin) =>
    admin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedAdmins = filteredAdmins.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  return (
    <div className="manage-admins">
      <div className="top-bar">
        <div className="header">
          <h2>👥 Admins in Your Tenant</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/invite-admin">
              <button className="invite-btn">➕ Invite Admin</button>
            </Link>
            <button
              className="add-btn"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? "Cancel" : "➕ Add Admin"}
            </button>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍 Search admins by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {showAddForm && (
        <form className="add-admin-form" onSubmit={handleAddAdmin}>
          <input
            type="text"
            placeholder="Name"
            value={newAdmin.name}
            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newAdmin.email}
            onChange={(e) =>
              setNewAdmin({ ...newAdmin, email: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newAdmin.password}
            onChange={(e) =>
              setNewAdmin({ ...newAdmin, password: e.target.value })
            }
            required
          />
          <button type="submit">Create Admin</button>
        </form>
      )}

      {filteredAdmins.length === 0 ? (
        <p>No matching admins found.</p>
      ) : (
        <>
          <div className="admin-list">
            {paginatedAdmins.map((admin) => (
              <div key={admin._id} className="admin-card">
                <h4>{admin.name}</h4>
                <p>{admin.email}</p>
                <div className="actions">
                  <button onClick={() => handlePromote(admin._id)}>
                    Promote to Manager
                  </button>
                  <button
                    onClick={() => handleDelete(admin._id)}
                    className="danger"
                  >
                    Delete Admin
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              ◀️
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              ▶️
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ManageAdmin;
