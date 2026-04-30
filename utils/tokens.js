const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const accessTokenSecret = process.env.JWT_ACCESS_SECRET || "studentlab_access_secret";
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || "studentlab_refresh_secret";
const accessTokenExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

function createAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    accessTokenSecret,
    { expiresIn: accessTokenExpiresIn }
  );
}

function createRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      type: "refresh"
    },
    refreshTokenSecret,
    { expiresIn: refreshTokenExpiresIn }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, accessTokenSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, refreshTokenSecret);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createRandomToken() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = {
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  createRandomToken
};
