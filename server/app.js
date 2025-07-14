require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db/config");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orgRoutes = require("./routes/orgRoutes");
const inviteRoutes = require("./routes/inviteRoutes");

const app = express();
connectDB();

// ✅ MUST BE FIRST — before any routes:
app.use(
  cors({
    origin: [
      
      "https://storehub-psi.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Optional: handle preflight properly (sometimes helps)
app.options("*", cors());

app.use(authRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use("/payment", paymentRoutes);
app.use(orderRoutes);
app.use("/admin", adminRoutes);
app.use("/organisation", orgRoutes);
app.use("/invites", inviteRoutes);

module.exports = app;
