function requireLogin(request, response, next) {
  if (!request.session.userId) {
    response.status(401).json({ error: "You must be logged in." });
    return;
  }
  next();
}

module.exports = { requireLogin };
