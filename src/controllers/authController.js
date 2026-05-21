import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

// POST /api/admin/login
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email aur password dono chahiye",
            });
        }

        // Find admin and include password
        const admin = await Admin.findOne({ email }).select("+password");

        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Email ya password galat hai",
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save({ validateBeforeSave: false });

        const token = generateToken(admin._id);

        res.json({
            success: true,
            message: "Login successful! 🎉",
            data: {
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/me — Get current admin
export const getMe = async (req, res) => {
    res.json({
        success: true,
        data: {
            id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
            role: req.admin.role,
        },
    });
};

// PUT /api/admin/password — Change password
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const admin = await Admin.findById(req.admin._id).select("+password");

        if (!(await admin.comparePassword(currentPassword))) {
            return res.status(400).json({
                success: false,
                message: "Current password galat hai",
            });
        }

        admin.password = newPassword;
        await admin.save();

        const token = generateToken(admin._id);

        res.json({
            success: true,
            message: "Password change ho gaya! 🔐",
            data: { token },
        });
    } catch (error) {
        next(error);
    }
};