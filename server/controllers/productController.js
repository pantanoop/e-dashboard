const Product = require("../models/Product");

// ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body,
      tenantId: req.user.tenantId, // ✅ Enforce tenant
    });

    const result = await newProduct.save();
    res.send(result);
  } catch (err) {
    console.error("❌ Error while saving product:", err);
    res.status(500).json({
      error: "Product creation failed",
      details: err.message,
    });
  }
};

// GET PRODUCTS (Tenant-safe for all roles)

exports.getProducts = async (req, res) => {
  const user = req.user;

  try {
    let products;

    if (user.role === "admin" || user.role === "manager") {
      // Only show products for the org
      products = await Product.find({ tenantId: user.tenantId });
    } else {
      // Regular users
      products = await Product.find({});
    }

    res.send(products);
  } catch (err) {
    console.error("❌ Product fetch failed:", err);
    res.status(500).send({ error: "Failed to fetch products" });
  }
};

// GET SINGLE PRODUCT
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId, // ✅ prevent cross-tenant access
    });

    if (!product) {
      return res.status(404).json({ result: "No record found" });
    }

    res.send(product);
  } catch (err) {
    console.error("❌ Error fetching product:", err.message);
    res.status(500).json({
      error: "Something went wrong",
      details: err.message,
    });
  }
};

// UPDATE PRODUCT (Only within tenant)
exports.updateProduct = async (req, res) => {
  try {
    const result = await Product.updateOne(
      { _id: req.params.id, tenantId: req.user.tenantId }, // ✅ secure update
      { $set: req.body }
    );
    res.send(result);
  } catch (err) {
    res.status(500).json({
      error: "Failed to update product",
      details: err.message,
    });
  }
};

// DELETE PRODUCT (Only within tenant)
exports.deleteProduct = async (req, res) => {
  console.log("🛠 delete Product controller HIT");
  try {
    const result = await Product.deleteOne({
      _id: req.params.id,
      tenantId: req.user.tenantId, // ✅ secure delete
    });
    res.send(result);
  } catch (err) {
    res.status(500).json({
      error: "Failed to delete product",
      details: err.message,
    });
  }
};

// SEARCH PRODUCTS (Tenant filtered)
exports.searchProduct = async (req, res) => {
  try {
    const result = await Product.find({
      tenantId: req.user.tenantId, // ✅ restrict to org
      $or: [
        { name: { $regex: req.params.key, $options: "i" } },
        { category: { $regex: req.params.key, $options: "i" } },
        { company: { $regex: req.params.key, $options: "i" } },
      ],
    });

    res.send(result);
  } catch (err) {
    res.status(500).json({
      error: "Search failed",
      details: err.message,
    });
  }
};
