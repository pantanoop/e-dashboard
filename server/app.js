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


app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://storehub-psi.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(authRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use("/payment", paymentRoutes);
app.use(orderRoutes);
app.use("/admin", adminRoutes);
app.use("/organisation", orgRoutes);
app.use("/invites", inviteRoutes);

module.exports = app;
