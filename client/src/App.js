import "./App.css";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import PrivateComponent from "./components/PrivateComponent";
import AuthContext from "./contexts/auth";
import Logout from "./components/Logout";
import Login from "./components/Login";
import AddProduct from "./components/AddProduct";
import ProductList from "./components/ProductList";
import UpdateProduct from "./components/UpdateProduct";
import CartPage from "./components/CartPage";
import { CartContext } from "./contexts/CartContext";
import AdminPrivateComponent from "./components/AdminPrivateComponent";
import OrgAccessPage from "./components/OrgAccessPage";
import ProfilePage from "./components/ProfilePage";
import ManageAdmin from "./components/ManageAdmin";
import CreateOrganisation from "./components/CreateOrganisation";
import { useState, useEffect } from "react";
import AcceptInvite from "./components/AcceptInvite";
import InviteUser from "./components/InviteUser";
import { LoadingProvider } from "./contexts/loadingContext";
import HomePage from "./components/HomePage";

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user_data = localStorage.getItem("user");
    if (user_data) {
      setUser(JSON.parse(user_data));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token) return;

    async function fetchCart() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/cart/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCart(data.products || []);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setCart([]);
      }
    }

    fetchCart();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <LoadingProvider>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <AuthContext.Provider value={{ user, setUser }}>
          <CartContext.Provider value={{ cart, setCart }}>
            <div className="App">
              <BrowserRouter>
                <Nav />
                <div className="main-content">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductList />} />

                    {user?.role === "user" && (
                      <Route element={<PrivateComponent />}>
                        <Route path="/cart" element={<CartPage />} />
                      </Route>
                    )}

                    {(user?.role === "admin" || user?.role === "manager") && (
                      <Route element={<AdminPrivateComponent />}>
                        <Route path="/add" element={<AddProduct />} />
                        <Route path="/update/:id" element={<UpdateProduct />} />
                      </Route>
                    )}

                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route
                      path="/login"
                      element={user ? <Navigate to="/" /> : <Login />}
                    />
                    <Route path="/org-access" element={<OrgAccessPage />} />
                    <Route
                      path="/create-organisation"
                      element={<CreateOrganisation />}
                    />

                    <Route
                      path="/accept-invite/:token"
                      element={<AcceptInvite />}
                    />

                    {user?.role === "manager" && (
                      <>
                        <Route
                          path="/manage-admins"
                          element={<ManageAdmin />}
                        />
                        <Route path="/invite-admin" element={<InviteUser />} />
                      </>
                    )}

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
                <Footer />
              </BrowserRouter>
            </div>
          </CartContext.Provider>
        </AuthContext.Provider>
      </GoogleOAuthProvider>
    </LoadingProvider>
  );
}

export default App;
