
const jwt = require("jsonwebtoken");
require("dotenv").config(); // To load environment variables from a .env file

// Use environment variable for JWT_SECRET or provide a default value
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Access forbidden: Missing or invalid token" });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(" ")[1];

    try {
        // Verify the token using JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if the token contains a valid userId
        if (decoded.userId) {
            req.user = { userId: decoded.userId }; // Attach the userId to the request object for later use
            next(); // Proceed to the next middleware or route handler
        } else {
            return res.status(403).json({ message: "Access forbidden: Invalid token" });
        }
    } catch (err) {
        // Handle token verification errors
        return res.status(403).json({ message: "Access forbidden: Invalid or expired token" });
    }
};

module.exports = { authMiddleware };
