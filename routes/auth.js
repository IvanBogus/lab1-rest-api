const express = require("express");
const bcrypt = require("bcryptjs");
const { User } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { validate, isEmail, isStrongEnoughPassword } = require("../middleware/validate");
const {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  hashToken,
  createRandomToken
} = require("../utils/tokens");
const { sanitizeUser } = require("../utils/userResponse");

const router = express.Router();
const maxLoginAttempts = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const lockMinutes = Number(process.env.LOGIN_LOCK_MINUTES) || 15;

function issueTokens(user) {
  return {
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user)
  };
}

async function saveRefreshToken(user, refreshToken) {
  await user.update({ refresh_token_hash: hashToken(refreshToken) });
}

function validateRegistrationBody(req, res, next) {
  const { name, email, password, passwordConfirmation, role } = req.body;

  if (!name || !email || !password || !passwordConfirmation) {
    return res.status(400).json({
      message: "Validation error",
      errors: ["name, email, password and passwordConfirmation are required"]
    });
  }

  if (!isEmail(email)) {
    return res.status(400).json({ message: "Validation error", errors: ["valid email is required"] });
  }

  if (!isStrongEnoughPassword(password)) {
    return res.status(400).json({
      message: "Validation error",
      errors: ["password must contain at least 8 characters"]
    });
  }

  if (password !== passwordConfirmation) {
    return res.status(400).json({
      message: "Validation error",
      errors: ["password confirmation does not match"]
    });
  }

  if (role && !["admin", "user"].includes(role)) {
    return res.status(400).json({
      message: "Validation error",
      errors: ["role must be admin or user"]
    });
  }

  next();
}

router.post("/register", validateRegistrationBody, async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password_hash: await bcrypt.hash(password, 10),
      role: role || "user",
      email_confirmation_token: createRandomToken()
    });

    const tokens = issueTokens(user);
    await saveRefreshToken(user, tokens.refreshToken);

    res.status(201).json({
      message: "User registered successfully",
      user: sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      emailConfirmationToken: user.email_confirmation_token
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", validate(["email", "password"]), async (req, res, next) => {
  try {
    const normalizedEmail = req.body.email.trim().toLowerCase();
    const user = await User.findOne({ where: { email: normalizedEmail } });
    const now = new Date();

    if (user?.locked_until && user.locked_until > now) {
      return res.status(429).json({
        message: `Too many failed login attempts. Try again after ${user.locked_until.toISOString()}`
      });
    }

    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash || ""))) {
      if (user) {
        const nextAttempts = user.login_attempts + 1;
        const lockUntil = nextAttempts >= maxLoginAttempts
          ? new Date(Date.now() + lockMinutes * 60 * 1000)
          : null;

        await user.update({
          login_attempts: nextAttempts,
          locked_until: lockUntil
        });
      }

      return res.status(401).json({ message: "Invalid email or password" });
    }

    await user.update({ login_attempts: 0, locked_until: null });
    const tokens = issueTokens(user);
    await saveRefreshToken(user, tokens.refreshToken);

    res.json({
      message: "Login successful",
      user: sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    await req.user.update({ refresh_token_hash: null });
    res.json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh", validate(["refreshToken"]), async (req, res, next) => {
  try {
    const payload = verifyRefreshToken(req.body.refreshToken);

    if (payload.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findByPk(payload.id);

    if (!user || user.refresh_token_hash !== hashToken(req.body.refreshToken)) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const tokens = issueTokens(user);
    await saveRefreshToken(user, tokens.refreshToken);

    res.json({
      message: "Token refreshed successfully",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

router.get("/profile", authMiddleware, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

router.put("/profile", authMiddleware, async (req, res, next) => {
  try {
    const updates = {};

    if (req.body.name !== undefined) {
      if (!String(req.body.name).trim()) {
        return res.status(400).json({ message: "Validation error", errors: ["name must not be empty"] });
      }

      updates.name = req.body.name.trim();
    }

    if (req.body.email !== undefined) {
      if (!isEmail(req.body.email)) {
        return res.status(400).json({ message: "Validation error", errors: ["valid email is required"] });
      }

      updates.email = req.body.email.trim().toLowerCase();
      updates.email_confirmed = false;
      updates.email_confirmation_token = createRandomToken();
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: "No valid profile fields provided" });
    }

    await req.user.update(updates);

    res.json({
      message: "Profile updated successfully",
      user: sanitizeUser(req.user),
      emailConfirmationToken: updates.email_confirmation_token
    });
  } catch (error) {
    next(error);
  }
});

router.put("/change-password", authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword, newPasswordConfirmation } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirmation) {
      return res.status(400).json({
        message: "Validation error",
        errors: ["currentPassword, newPassword and newPasswordConfirmation are required"]
      });
    }

    if (!isStrongEnoughPassword(newPassword)) {
      return res.status(400).json({
        message: "Validation error",
        errors: ["newPassword must contain at least 8 characters"]
      });
    }

    if (newPassword !== newPasswordConfirmation) {
      return res.status(400).json({
        message: "Validation error",
        errors: ["new password confirmation does not match"]
      });
    }

    const passwordMatches = await bcrypt.compare(currentPassword, req.user.password_hash || "");

    if (!passwordMatches) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    await req.user.update({
      password_hash: await bcrypt.hash(newPassword, 10),
      refresh_token_hash: null
    });

    res.json({ message: "Password changed successfully. Please login again." });
  } catch (error) {
    next(error);
  }
});

router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", validate(["email"]), async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email.trim().toLowerCase() } });

    if (!user) {
      return res.json({
        message: "If this email exists, password recovery instructions were generated"
      });
    }

    const resetToken = createRandomToken();
    await user.update({
      reset_password_token: resetToken,
      reset_password_expires_at: new Date(Date.now() + 60 * 60 * 1000)
    });

    res.json({
      message: "Password recovery token generated",
      resetPasswordToken: resetToken
    });
  } catch (error) {
    next(error);
  }
});

router.post("/confirm-email", validate(["token"]), async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { email_confirmation_token: req.body.token } });

    if (!user) {
      return res.status(400).json({ message: "Invalid confirmation token" });
    }

    await user.update({
      email_confirmed: true,
      email_confirmation_token: null
    });

    res.json({
      message: "Email confirmed successfully",
      user: sanitizeUser(user)
    });
  } catch (error) {
    next(error);
  }
});

router.post("/google", validate(["email", "name", "googleId"]), async (req, res, next) => {
  try {
    const normalizedEmail = req.body.email.trim().toLowerCase();
    let user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user) {
      user = await User.create({
        name: req.body.name.trim(),
        email: normalizedEmail,
        google_id: String(req.body.googleId),
        email_confirmed: true,
        role: "user"
      });
    } else if (!user.google_id) {
      await user.update({
        google_id: String(req.body.googleId),
        email_confirmed: true
      });
    }

    const tokens = issueTokens(user);
    await saveRefreshToken(user, tokens.refreshToken);

    res.json({
      message: "Google login successful",
      user: sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
