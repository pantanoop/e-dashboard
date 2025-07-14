const Cart = require("../models/Cart");

exports.addToCart = async (req, res) => {
  const userId = req.user._id;
  const tenantId = req.user.tenantId;
  const { productId, quantity = 1 } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId
      );
      if (itemIndex > -1) {
        cart.products[itemIndex].quantity += quantity;
      } else {
        cart.products.push({ productId, quantity });
      }
      cart.updatedAt = new Date();
    } else {
      cart = new Cart({
        userId,
        tenantId,
        products: [{ productId, quantity }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to add to cart", details: err.message });
  }
};

exports.getCart = async (req, res) => {
  // console.log("req.user:", req.user);
  // console.log("req.user._id:", req.user._id, typeof req.user._id);

  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate("products.productId")
      .exec();
    res.json(cart || { products: [] });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch cart", details: err.message });
  }
};

exports.deleteFromCart = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.products = cart.products.filter(
      (p) => p.productId.toString() !== productId
    );
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ success: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete item", details: err.message });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.products.find((p) => p._id.toString() === itemId);
    if (!item) return res.status(404).json({ error: "Item not found in cart" });

    if (quantity < 1) {
      return res.status(400).json({ error: "Quantity must be at least 1" });
    }

    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ success: true, item });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update quantity", details: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    await Cart.deleteMany({ userId });
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
