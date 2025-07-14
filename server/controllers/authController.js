const User = require("../models/User");
const Organisation = require("../models/Organisation");
const Jwt = require("jsonwebtoken");
const jwtKey = "e-comm";
const { v4: uuidv4 } = require("uuid");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send({ result: "Email or password missing" });

  try {
    const user = await User.findOne({ email, password }).select("-password");
    if (!user) {
      return res.status(404).send({ result: "User not found" });
    }

    const org = await Organisation.findOne({ tenantId: user.tenantId });

    if (org) {
      if (user.role !== "admin" && user.role !== "manager") {
        return res.status(403).send({
          result: "User is not authorized (must be admin or manager)",
        });
      }
    } else {
      if (user.role !== "user") {
        return res.status(403).send({
          result: "Invalid role for non-organisation user",
        });
      }
    }

    const payload = {
      _id: user._id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    Jwt.sign(payload, jwtKey, { expiresIn: "48h" }, (err, token) => {
      if (err) return res.status(500).send({ result: "JWT creation failed" });
      res.send({ user, token });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send({ result: "Server error during login" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Email and name are required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: "",
        role: "user",
        tenantId: "",
      });
      await user.save();
    }

    if (user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only regular users can login with Google" });
    }

    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    Jwt.sign(payload, jwtKey, { expiresIn: "48h" }, (err, token) => {
      if (err) return res.status(500).json({ message: "JWT creation failed" });
      res.json({ user, token });
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
