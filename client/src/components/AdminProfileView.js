import { useState, useEffect } from "react";

function AdminProfileView() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [orderList, setOrderList] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [userList, setUserList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchOrder, setSearchOrder] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  const itemsPerPage = 5;
  const user = JSON.parse(localStorage.getItem("user"));
  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    fetchTenantStats();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  const fetchTenantStats = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/orders/tenant?sort=${sortOrder}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setStats({
        totalProducts: data.totalProducts,
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
      });
      setOrderList(data.orders);
      setAllOrders(data.orders);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUserList(data);
      setAllUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const filteredOrders = allOrders.filter((order) =>
    order.userId?.name?.toLowerCase().includes(searchOrder.toLowerCase())
  );

  const filteredUsers = allUsers.filter((u) =>
    u.name?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(
    (userPage - 1) * itemsPerPage,
    userPage * itemsPerPage
  );

  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * itemsPerPage,
    orderPage * itemsPerPage
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-info">
        <h2>🏢 Admin Dashboard</h2>
        <p>
          <strong>Organisation:</strong>{" "}
          {localStorage.getItem("organisationName")} <br />
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>{user.role}:</strong> {user.name} ({user.email})
        </p>
      </div>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="dashboard-cards">
            <div className="card">
              <h3>📦 Total Products</h3>
              <p>{stats.totalProducts}</p>
            </div>
            <div className="card">
              <h3>🛒 Total Orders</h3>
              <p>{stats.totalOrders}</p>
            </div>
            <div className="card">
              <h3>💰 Total Revenue</h3>
              <p>₹{stats.totalRevenue}</p>
            </div>
          </div>

          <h3
            onClick={() => setShowUsers(!showUsers)}
            style={{ cursor: "pointer" }}
          >
            {showUsers ? "👥 Hide Users" : "👥 Show Users"}
          </h3>

          {showUsers && (
            <div className="users-section">
              <div className="orders-header">
                <input
                  type="text"
                  placeholder="Search users by name"
                  value={searchUser}
                  onChange={(e) => {
                    setSearchUser(e.target.value);
                    setUserPage(1);
                  }}
                  className="search-input"
                />
              </div>

              {filteredUsers.length > 0 ? (
                <>
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((u) => (
                        <tr key={u._id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button
                      onClick={() => setUserPage(userPage - 1)}
                      disabled={userPage === 1}
                    >
                      ◀️
                    </button>
                    <span>
                      Page {userPage} of{" "}
                      {Math.ceil(filteredUsers.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={() => setUserPage(userPage + 1)}
                      disabled={
                        userPage ===
                        Math.ceil(filteredUsers.length / itemsPerPage)
                      }
                    >
                      ▶️
                    </button>
                  </div>
                </>
              ) : (
                <p>No users found.</p>
              )}
            </div>
          )}

          <h3
            onClick={() => setShowOrders(!showOrders)}
            style={{ cursor: "pointer" }}
          >
            {showOrders ? "📋 Hide Orders" : "📋 Show Orders"}
          </h3>

          {showOrders && (
            <div className="orders-section">
              <div className="orders-header">
                <div className="filters">
                  <label>
                    <select
                      value={sortOrder}
                      onChange={(e) => {
                        setSortOrder(e.target.value);
                        setOrderPage(1);
                      }}
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </label>
                  <input
                    type="text"
                    placeholder="Search orders by user name"
                    value={searchOrder}
                    onChange={(e) => {
                      setSearchOrder(e.target.value);
                      setOrderPage(1);
                    }}
                    className="search-input"
                  />
                </div>
              </div>

              {filteredOrders.length > 0 ? (
                <>
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Ordered By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.orderId}</td>
                          <td>₹{order.amount}</td>
                          <td>{order.status}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>{order.userId?.name || "Unknown"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="pagination">
                    <button
                      onClick={() => setOrderPage(orderPage - 1)}
                      disabled={orderPage === 1}
                    >
                      ◀️
                    </button>
                    <span>
                      Page {orderPage} of{" "}
                      {Math.ceil(filteredOrders.length / itemsPerPage)}
                    </span>
                    <button
                      onClick={() => setOrderPage(orderPage + 1)}
                      disabled={
                        orderPage ===
                        Math.ceil(filteredOrders.length / itemsPerPage)
                      }
                    >
                      ▶️
                    </button>
                  </div>
                </>
              ) : (
                <p>No orders found.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminProfileView;
