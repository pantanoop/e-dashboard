const mongoose = require("mongoose");
const Product = require("../models/Product");
const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { products, amount, paymentId, orderId } = req.body;
    const user = req.user;

    if (!products?.length || !amount || !paymentId || !orderId) {
      return res.status(400).json({ message: "Missing or invalid order data" });
    }

    const detailedProducts = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        return {
          productId: product._id,
          name: product.name,
          quantity: item.quantity,
        };
      })
    );

    const firstProduct = await Product.findById(products[0].productId);
    if (!firstProduct) {
      return res.status(404).json({ message: "First product not found" });
    }

    const tenantId = firstProduct.tenantId;
    if (!tenantId) {
      return res.status(500).json({ message: "Product missing tenant ID" });
    }

    const order = new Order({
      userId: user._id,
      tenantId,
      products: detailedProducts, // ✅ Store enriched product data
      amount,
      status: "paid",
      paymentId,
      orderId,
    });

    const saved = await order.save();
    return res.status(201).json({ message: "Order stored", order: saved });
  } catch (err) {
    console.error("Order creation failed:", err);
    return res
      .status(500)
      .json({ message: "Server error during order creation" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ orders }); // ✅ Wrap in { orders: [...] }
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Failed to get user orders" });
  }
};

exports.getTenantOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const sortOrder = req.query.sort === "asc" ? 1 : -1;

    const orders = await Order.find({ tenantId: req.user.tenantId })
      .populate("userId", "name email") // ✅ populate user name & email
      .sort({ createdAt: sortOrder });

    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

    const products = await Product.find({ tenantId: req.user.tenantId });

    res.json({
      totalOrders: orders.length,
      totalRevenue,
      totalProducts: products.length,
      orders,
    });
  } catch (err) {
    console.error("Error fetching tenant orders:", err);
    res.status(500).json({ message: "Failed to get tenant orders" });
  }
};
