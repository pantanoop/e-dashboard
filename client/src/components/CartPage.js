import { useCart } from "../contexts/CartContext";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadRazorpayScript } from "../utils/razorpay";
import AuthContext from "../contexts/auth";
import { useLoading } from "../contexts/loadingContext"; // ✅ global loading hook

function CartPage() {
  const { cart, setCart } = useCart();
  const { user } = useContext(AuthContext);
  const { showLoading, hideLoading } = useLoading(); // ✅ loading functions
  const navigate = useNavigate();

  useEffect(() => {
    getCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getCartItems() {
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token) return;

    showLoading();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();

      if (!res.ok || !Array.isArray(result.products)) {
        console.warn("Unexpected cart response:", result);
        setCart([]);
        return;
      }

      setCart(result.products);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setCart([]);
    } finally {
      hideLoading();
    }
  }

  async function handleRemove(productId) {
    const token = JSON.parse(localStorage.getItem("token"));
    showLoading();
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/cart/${productId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await res.json();

      if (res.ok) {
        alert("Product removed from cart");
        await getCartItems();
      } else {
        alert("Failed to remove product");
      }
    } catch (err) {
      console.error("Remove from cart failed:", err);
    } finally {
      hideLoading();
    }
  }

  async function handleQuantityChange(itemId, newQuantity) {
    const token = JSON.parse(localStorage.getItem("token"));
    showLoading();
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/cart/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      if (res.ok) {
        setCart((prev) =>
          prev.map((item) =>
            item._id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
      } else {
        alert("Failed to update quantity");
      }
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      hideLoading();
    }
  }

  async function handleProceedToPay(cart) {
    const token = JSON.parse(localStorage.getItem("token"));
    showLoading();
    try {
      const res = await loadRazorpayScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );

      if (!res) {
        alert("Razorpay SDK failed to load. Check your internet.");
        return;
      }

      const totalAmount = cart.reduce(
        (acc, item) => acc + item.productId.price * item.quantity,
        0
      );

      const orderRes = await fetch(
        `${process.env.REACT_APP_API_URL}/payment/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: totalAmount * 100 }),
        }
      );

      const { order } = await orderRes.json();

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Your Site Name",
        description: "Payment for Cart Items",
        order_id: order.id,
        handler: async function (response) {
          const verifyRes = await fetch(
            `${process.env.REACT_APP_API_URL}/payment/verify`,
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
            alert(verifyData.message || "✅ Payment verified!");

            const saveOrderRes = await fetch(
              `${process.env.REACT_APP_API_URL}/orders`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  products: cart.map((item) => ({
                    productId: item.productId._id,
                    name: item.name,
                    quantity: item.quantity,
                  })),
                  amount: order.amount,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                }),
              }
            );

            const saveOrderData = await saveOrderRes.json();

            if (saveOrderRes.ok) {
              alert("🧾 Order stored successfully!");
              await handleClearCart();
            } else {
              console.warn(
                "⚠️ Payment succeeded but order not saved:",
                saveOrderData
              );
              alert("⚠️ Order storage failed. Please contact support.");
            }
          } else {
            alert("❌ Payment verification failed.");
          }
        },
        prefill: {
          name: user?.name || "User",
          email: user?.email || "example@email.com",
          contact: "9999999999",
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setCart([]);
    } catch (err) {
      alert("❌ Something went wrong during payment.");
    } finally {
      hideLoading();
    }
  }

  async function handleClearCart() {
    const token = JSON.parse(localStorage.getItem("token"));
    showLoading();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      alert(data.message || "🧹 Cart cleared!");
      setCart([]);
    } catch (err) {
      console.error("Clear cart error:", err);
      alert("❌ Error clearing cart");
    } finally {
      hideLoading();
    }
  }

  return (
    <div className="product-list-container">
      <div className="cart-page-container">
        <button className="clear-cart-btn" onClick={handleClearCart}>
          🗑️ Clear Cart
        </button>
        <h2>🛒 Your Cart</h2>
      </div>

      {cart.length === 0 ? (
        <p className="no-products">Your cart is empty.</p>
      ) : (
        <div className="product-grid">
          {cart.map((item) => (
            <div key={item._id} className="product-card">
              <h3 className="product-name">{item.productId.name}</h3>
              <p>
                <strong>Price:</strong> ₹{item.productId.price}
              </p>
              <p>
                <strong>Category:</strong> {item.productId.category}
              </p>
              <p>
                <strong>Company:</strong> {item.productId.company}
              </p>
              <p>
                <strong>Quantity:</strong>
                <button
                  onClick={() =>
                    handleQuantityChange(item._id, item.quantity - 1)
                  }
                  disabled={item.quantity <= 1}
                  className="qty-btn"
                >
                  ➖
                </button>
                <span className="qty-count">{item.quantity}</span>
                <button
                  onClick={() =>
                    handleQuantityChange(item._id, item.quantity + 1)
                  }
                  className="qty-btn"
                >
                  ➕
                </button>
              </p>

              <button onClick={() => handleRemove(item.productId._id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="cart-btn">
        <button className="shop-more-btn" onClick={() => navigate("/products")}>
          🛍️ Shop More
        </button>
        <button
          className="shop-more-btn"
          onClick={() => handleProceedToPay(cart)}
        >
          💳 Proceed to Pay
        </button>
      </div>
    </div>
  );
}

export default CartPage;
