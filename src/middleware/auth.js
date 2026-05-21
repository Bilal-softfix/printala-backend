import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Protect routes — only logged-in admins
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }
        // Also check cookies
        else if (req.cookies && req.cookies.admin_token) {
            token = req.cookies.admin_token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Login required. Token not found.",
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if admin still exists
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin account not found.",
            });
        }

        // Attach admin to request
        req.admin = admin;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please login again.",
            });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again.",
            });
        }
        next(error);
    }
};