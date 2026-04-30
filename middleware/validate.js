function validate(requiredFields) {
  return (req, res, next) => {
    const missingFields = requiredFields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || String(value).trim() === "";
    });

    if (missingFields.length) {
      return res.status(400).json({
        message: "Validation error",
        errors: missingFields.map((field) => `${field} is required`)
      });
    }

    next();
  };
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

function isStrongEnoughPassword(value) {
  return typeof value === "string" && value.length >= 8;
}

module.exports = {
  validate,
  isEmail,
  isStrongEnoughPassword
};
