const config = require('../sync/config.js');

function authenticateServer(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader === 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWRtaW4iLCJpYXQiOjE2MjYwNjYwNzJ9.1') {
    next();
  } else {
    console.log(authHeader);
    res.sendStatus(404); // Forbidden
  }
}

module.exports = authenticateServer;