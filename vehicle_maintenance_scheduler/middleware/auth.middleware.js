const jwt = require("jsonwebtoken");

const Auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
    try {
        const decode = jwt.verify(token, process.env.SECRET || "secret");
        req.user = decode;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};

module.exports = Auth;