import { useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../contexts/auth";
import { useCart } from "../contexts/CartContext";

export function Nav() {
  const { user } = useContext(AuthContext);
  const { cart } = useCart();

  const isLoggedIn = !!user;
  const userRole = user?.role;
  const name = user?.name;
  const uniqueItems = cart?.length || 0;

  return (
    <div className="nav-container">
      <div className="nav-left">
        <Link to="/" className="logo-link">
          <img className="logo" alt="logo" src="/test1.png" />
        </Link>

        {isLoggedIn && (
          <>
            <Link to="/products">
              {userRole === "user" ? "Products" : "Inventory"}
            </Link>
            {userRole === "user" && (
              <Link to="/cart">
                🛒 Cart <sup className="sup-count">{uniqueItems}</sup>
              </Link>
            )}
            {(userRole === "admin" || userRole === "manager") && (
              <Link to="/add">Add Product</Link>
            )}
            <Link to="/profile">Profile</Link>
            {user?.role === "manager" && (
              <Link to="/manage-admins">Manage Admins</Link>
            )}
            {user && !user.tenantId && (
              <Link to="/create-organisation" className="nav-link">
                🏢 Create Organisation
              </Link>
            )}
          </>
        )}
      </div>

      <div className="nav-right">
        {isLoggedIn ? (
          <Link to="/logout">
            Log Out <span className="user-name">({name})</span>
          </Link>
        ) : (
          <>
            <Link to="/org-access">Log In</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Nav;
