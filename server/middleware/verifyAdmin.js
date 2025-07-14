module.exports = function (req, res, next) {
  //console.log("Decoded token role in admin:", req.user.role);
  if (req.user && (req.user.role === "admin" || req.user.role === "manager")) {
    return next();
  }
  return res
    .status(403)
    .json({ result: "Access denied: Admins or Managers only" });
};
