import multer from "multer";
import path from "path";
import fs from "fs";

// Make sure directory exists
const uploadDir = "uploads/products";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Temporary name — sharp will create the final optimized file
        const tempName = `temp-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, tempName);
    },
});

// File filter — only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/avif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Sirf .jpg, .jpeg, .png, .webp files allowed hain. Ye format support nahi karta."
            ),
            false
        );
    }
};

// Single image upload
export const uploadSingle = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
}).single("image");

// Multiple images upload (max 5)
export const uploadMultiple = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
}).array("images", 5);

// Error handler wrapper
export const handleUploadError = (req, res, next) => {
    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "File bahut badi hai! Maximum 10MB allowed.",
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        next();
    });
};

export const handleMultipleUploadError = (req, res, next) => {
    uploadMultiple(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    success: false,
                    message: "File bahut badi hai! Maximum 10MB per file.",
                });
            }
            if (err.code === "LIMIT_UNEXPECTED_FILE") {
                return res.status(400).json({
                    success: false,
                    message: "Maximum 5 images at a time!",
                });
            }
            return res.status(400).json({ success: false, message: err.message });
        }
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
};

export default { uploadSingle, uploadMultiple, handleUploadError, handleMultipleUploadError };