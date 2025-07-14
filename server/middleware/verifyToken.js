const Jwt = require("jsonwebtoken");
const jwtKey = "e-comm";
// console.log("verifyToken middleware HIT");

module.exports = function (req, res, next) {
  let token = req.headers["authorization"];

  if (token) {
    token = token.split(" ")[1];

    Jwt.verify(token, jwtKey, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ result: "Invalid token", error: err.message });
      } else {
        req.user = decoded;
        // console.log("Decoded user from token:", req.user);

        next();
      }
    });
  } else {
    res.status(403).json({ result: "Token required" });
  }
};
