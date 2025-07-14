const Invite = require("../models/Invite");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

// ✅ Setup email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your 16-char app password
  },
});

exports.sendInvite = async (req, res) => {
  const { email, role } = req.body;
  const inviter = req.user;

  if (!["admin", "manager"].includes(inviter.role)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const token = uuidv4();

    const invite = new Invite({
      email,
      role,
      tenantId: inviter.tenantId,
      token,
    });

    await invite.save();

    const inviteLink = `http://localhost:3000/accept-invite/${token}`;
    console.log("📧 Sending mail to:", email);
    // ✅ Compose HTML Email
    const mailOptions = {
      from: `"${inviter.name || "Organisation"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `You’re Invited as ${role} to Organisation`,
      html: `
        <div style="font-family:sans-serif;">
          <h2>You're invited to join an organisation!</h2>
          <p>You have been invited as a <strong>${role}</strong> in <strong>${inviter.tenantId}</strong>.</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${inviteLink}" style="display:inline-block;padding:10px 20px;background-color:#007bff;color:white;text-decoration:none;border-radius:4px;">
            Accept Invite
          </a>
          <p>This invite will expire in 2 days.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✉️ Invite sent to:", email, "| Link:", inviteLink);
    res.json({ message: "Invite sent successfully", inviteLink });
  } catch (error) {
    console.error("❌ Error sending invite:", error);
    res
      .status(500)
      .json({ message: "Failed to send invite", error: error.message });
  }
};

exports.acceptInvite = async (req, res) => {
  const { token, name, password } = req.body;

  try {
    const invite = await Invite.findOne({ token });
    if (!invite)
      return res.status(400).json({ message: "Invalid or expired invite" });

    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const newUser = new User({
      name,
      email: invite.email,
      password,
      role: invite.role,
      tenantId: invite.tenantId,
    });

    await newUser.save();
    await Invite.deleteOne({ token });

    res.json({ message: "Account created successfully" });
  } catch (err) {
    console.error("❌ Error accepting invite:", err);
    res
      .status(500)
      .json({ message: "Error creating account", error: err.message });
  }
};
