import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;

  return (
    <main className="home-container">
      <div className="hero-section">
        <div className="hero-text">
          <h1 className="home-title">
            Welcome to <span className="brand">StoreHub</span>
          </h1>
          <p className="home-subtitle">
            Your all-in-one platform for managing products, users, and orders
            with ease.
          </p>

          <Link to="/products">
            <button className="cta-button">
              {userRole === "user" ? "Explore Products" : "Your Inventory"}
            </button>
          </Link>

          <ul className="feature-list">
            <li>🛒 Multi-tenant product & inventory system</li>
            <li>👥 Admin/Manager access & user management</li>
            <li>💳 Razorpay payments & order tracking</li>
            <li>📊 Role-based analytics & dashboards</li>
          </ul>
        </div>

        <div className="hero-image">
          <img src="/storeHub.png" alt="StoreHub Dashboard Preview" />
        </div>
      </div>
    </main>
  );
}

export default HomePage;
