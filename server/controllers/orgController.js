const Organisation = require("../models/Organisation");
const User = require("../models/User");

exports.createOrganisation = async (req, res) => {
  try {
    const { organisationName, tenantId } = req.body;
    const userId = req.user._id;

    const existing = await Organisation.findOne({ tenantId });
    if (existing)
      return res.status(400).json({ message: "Tenant ID already exists" });

    const newOrg = new Organisation({
      organisationName,
      tenantId,
      users: [userId],
      createdAt: new Date(),
    });
    await newOrg.save();

    await User.findByIdAndUpdate(userId, { tenantId, role: "manager" });

    res
      .status(201)
      .json({ message: "Organisation created", organisation: newOrg });
  } catch (err) {
    console.error("Org creation failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserRoleTenant = async (req, res) => {
  try {
    const { userId, role, tenantId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { role, tenantId },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User updated", user });
  } catch (err) {
    console.error("Failed to update user:", err);
    res.status(500).json({ message: "Server error" });
  }
};
