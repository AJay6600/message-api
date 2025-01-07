const jwt = require("jsonwebtoken");

/** Middleware function to check for a valid user */
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  // Check if Authorization header is present
  if (!authHeader) {
    const error = new Error("Authorization header not found.");
    error.statusCode = 401;
    return next(error); // Return error to avoid executing the rest of the code
  }

  // Check if the header has the 'Bearer <token>' format
  const token = authHeader.split(" ")[1];

  if (!token) {
    const error = new Error("Token not provided or malformed.");
    error.statusCode = 401;
    return next(error); // Return error to avoid executing the rest of the code
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      token,
      "wesrcfgvbhnomk,pl[.;,[lmonibhuvgyfctdxrzse"
    );
  } catch (err) {
    err.statusCode = 500;
    return next(err); // Pass the error to the next middleware
  }

  if (!decodedToken) {
    const error = new Error("Failed to authenticate token.");
    error.statusCode = 401;
    return next(error); // Return error to avoid executing the rest of the code
  }

  // Token is valid, attach user info to the request
  req.userId = decodedToken.userId;
  next(); // Proceed to the next middleware or route handler
};
