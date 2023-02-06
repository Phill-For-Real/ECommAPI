//general error handler function
function errorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'The user is not Authorized' });
  }

  if (err.name === 'ValidationError') {
    return res.status(401).json({ message: err });
  }

  return res.status(500).json({ err });
}

module.exports = errorHandler;
