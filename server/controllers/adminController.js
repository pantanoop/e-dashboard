const User = require("../models/User");

exports.getTenantUsers = async (req, res) => {
  try {
    const { role, tenantId } = req.user;

    // Only allow admin and manager to view users
    if (role !== "admin" && role !== "manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    let users;

    if (role === "admin") {
      // Admin can see all users in their tenant
      users = await User.find({ tenantId }).select("-password");
    } else if (role === "manager") {
      // Manager can only see admins under their tenant
      users = await User.find({
        tenantId,
        role: { $in: ["admin", "manager"] },
      }).select("-password");
    }

    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addAdmin = async (req, res) => {
  try {
    const { role, tenantId } = req.user;
    const { name, email, password } = req.body;

    if (role !== "manager") {
      return res.status(403).json({ message: "Only managers can add admins" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const newAdmin = new User({
      name,
      email,
      password,
      role: "admin",
      tenantId,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin created", user: newAdmin });
  } catch (err) {
    console.error("Failed to add admin:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { role, tenantId } = req.user;
    const { userId } = req.params;

    // Only managers can delete admins
    if (role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can delete admins" });
    }

    const user = await User.findOne({ _id: userId, tenantId });

    if (!user || user.role !== "admin") {
      return res
        .status(404)
        .json({ message: "Admin not found in your tenant" });
    }

    await User.deleteOne({ _id: userId });

    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.promoteToManager = async (req, res) => {
  try {
    const { role, tenantId } = req.user;
    const { userId } = req.params;

    // Only managers can promote admins
    if (role !== "manager") {
      return res.status(403).json({ message: "Only managers can promote" });
    }

    // Find the target user
    const user = await User.findOne({ _id: userId, tenantId });

    if (!user || user.role !== "admin") {
      return res
        .status(404)
        .json({ message: "Admin not found in your tenant" });
    }

    user.role = "manager";
    await user.save();

    res.json({ message: "User promoted to manager", user });
  } catch (err) {
    console.error("Failed to promote:", err);
    res.status(500).json({ message: "Server error" });
  }
};
