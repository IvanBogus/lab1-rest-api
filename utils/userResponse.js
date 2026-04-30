function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const plainUser = typeof user.toJSON === "function" ? user.toJSON() : user;

  return {
    id: plainUser.id,
    name: plainUser.name,
    email: plainUser.email,
    role: plainUser.role,
    email_confirmed: plainUser.email_confirmed,
    google_id: plainUser.google_id || null,
    created_at: plainUser.created_at,
    updated_at: plainUser.updated_at
  };
}

module.exports = {
  sanitizeUser
};
