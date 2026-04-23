const jwt = require('jsonwebtoken');

// This is a MIDDLEWARE function — it runs before any protected route
// Think of it as a bouncer at a club checking wristbands
const protect = (req, res, next) => {

    let token;

    // Every protected request must send a header like this:
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    // We check if that header exists and starts with "Bearer"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        
        // Split "Bearer abc123" by space → grab index [1] which is just "abc123"
        token = req.headers.authorization.split(' ')[1];
    }

    // If no token was found in the header, block the request immediately
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized — no token provided' 
        });
    }

    try {
        // jwt.verify() decodes the token using our secret key
        // If the token was tampered with or expired, it throws an error
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded admin info to the request object
        // so the next route can access it via req.admin
        req.admin = decoded;

        // Token is valid — call next() to move to the actual route
        next();

    } catch (error) {
        // Token was invalid, expired, or tampered with
        return res.status(401).json({ 
            success: false, 
            message: 'Token is invalid or expired' 
        });
    }
};

module.exports = protect;