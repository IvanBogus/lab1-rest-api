const { User } = require("../models");
const { verifyAccessToken } = require("../utils/tokens");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.id);

    if (!user) {
      return res.status(401).json({ message: "User for this token was not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
