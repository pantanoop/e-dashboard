import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { loadRazorpayScript } from "../utils/razorpay";
import AuthContext from "../contexts/auth";
import { useLoading } from "../contexts/loadingContext"; // ✅ global loading

function ProductList() {
  const { setCart } = useCart();
  const { user } = useContext(AuthContext);
  const { showLoading, hideLoading } = useLoading(); // ✅ spinner control
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const organisationName = localStorage.getItem("organisationName");
  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch(debouncedQuery);
    } else {
      getProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getProducts() {
    showLoading(); // ✅
    try {
      const res = await fetch("http://localhost:5000/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !Array.isArray(result)) {
        console.warn("Unexpected or unauthorized response", result);
        setProducts([]);
        return;
      }
      setProducts(result);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    } finally {
      hideLoading(); // ✅
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    showLoading(); // ✅
    try {
      const res = await fetch(`http://localhost:5000/product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (res.ok) {
        alert("✅ Product deleted");
        getProducts();
      } else {
        alert("❌ Failed to delete product");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("❌ Error deleting product");
    } finally {
      hideLoading(); // ✅
    }
  }

  async function handleSearch(searchTerm) {
    showLoading(); // ✅
    try {
      const res = await fetch(`http://localhost:5000/search/${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !Array.isArray(result)) {
        console.warn("Invalid search result or unauthorized");
        setProducts([]);
        return;
      }
      setProducts(result);
    } catch (err) {
      console.error("Search error:", err);
      setProducts([]);
    } finally {
      hideLoading(); // ✅
    }
  }

  async function handleAddToCart(productId) {
    showLoading(); // ✅
    try {
      const res = await fetch("http://localhost:5000/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (res.ok) {
        setSuccessMessage("✅ Added to cart!");
        setTimeout(() => setSuccessMessage(""), 2000);

        const cartRes = await fetch("http://localhost:5000/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartData = await cartRes.json();
        setCart(cartData.products);
      } else {
        alert("❌ Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      hideLoading(); // ✅
    }
  }

  async function handleBuyNow(product) {
    showLoading(); // ✅
    try {
      const razorpayLoaded = await loadRazorpayScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!razorpayLoaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        return;
      }

      const orderRes = await fetch(
        "http://localhost:5000/payment/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: product.price * 100 }),
        }
      );

      const data = await orderRes.json();
      const order = data.order;

      if (!orderRes.ok || !order) {
        console.error("❌ Failed to create order:", data);
        alert("Server error: Unable to create order.");
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Your Site Name",
        description: `Buy ${product.name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(
              "http://localhost:5000/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              alert(verifyData.message || "✅ Payment successful!");

              const saveOrderRes = await fetch("http://localhost:5000/orders", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  tenantId: product.tenantId,
                  products: [
                    {
                      productId: product._id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                    },
                  ],
                  amount: product.price,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                }),
              });

              const saveOrderData = await saveOrderRes.json();
              if (saveOrderRes.ok) {
                alert("🧾 Order stored successfully!");
              } else {
                console.warn("⚠️ Order save failed:", saveOrderData);
                alert("⚠️ Order save failed, but payment succeeded.");
              }
            } else {
              alert("❌ Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification or save error:", err);
            alert("Unexpected error after payment.");
          } finally {
            hideLoading(); // ✅
          }
        },
        prefill: {
          name: user?.name || "User",
          email: user?.email || "example@email.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Buy now error:", err);
      alert("Something went wrong. Please try again.");
      hideLoading(); // ✅ in catch too
    }
  }

  return (
    <div className="product-list-container">
      <input
        type="text"
        placeholder="Search Product"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <h2>
        {["admin", "manager"].includes(user?.role)
          ? `Your Inventory (${organisationName})`
          : "🛒 Shop Products"}
      </h2>

      {successMessage && <p className="success-message">{successMessage}</p>}

      {products.length === 0 ? (
        <p className="no-products">No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <h3 className="product-name">{product.name}</h3>
              <p>
                <strong>Price:</strong> ₹{product.price}
              </p>
              <p>
                <strong>Category:</strong> {product.category}
              </p>
              <p>
                <strong>Company:</strong> {product.company}
              </p>

              {["admin", "manager"].includes(user?.role) ? (
                <>
                  <button onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                  <Link to={`/update/${product._id}`}>Update</Link>
                </>
              ) : (
                <div className="btn-users">
                  <button onClick={() => handleBuyNow(product)}>Buy Now</button>
                  <button onClick={() => handleAddToCart(product._id)}>
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
