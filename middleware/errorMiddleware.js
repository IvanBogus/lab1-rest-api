function errorMiddleware(error, req, res, next) {
  const statusCode = error.statusCode || error.status || 500;

  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, {
    message: error.message,
    stack: error.stack
  });

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ message: "Record with this value already exists" });
  }

  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: error.errors.map((item) => item.message)
    });
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : error.message
  });
}

module.exports = errorMiddleware;
