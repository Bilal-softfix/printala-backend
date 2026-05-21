// controllers/uploadController.js — FIXED
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "../../uploads/products");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ─── Disable sharp's file cache (prevents Windows EPERM) ───
sharp.cache(false);

// POST /api/upload
export const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Koi image select nahi ki! Please upload an image.",
            });
        }

        const originalPath = req.file.path;
        const baseName = `poster-${Date.now()}`;

        // ── Read file into buffer FIRST so Sharp doesn't lock the file ──
        const inputBuffer = fs.readFileSync(originalPath);

        // Optimized full-size
        const optimizedFileName = `${baseName}.webp`;
        const optimizedPath = path.join(UPLOAD_DIR, optimizedFileName);

        await sharp(inputBuffer)          // ← buffer, not file path
            .resize(1200, 1600, {
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality: 85 })
            .toFile(optimizedPath);

        // Thumbnail
        const thumbFileName = `${baseName}-thumb.webp`;
        const thumbPath = path.join(UPLOAD_DIR, thumbFileName);

        await sharp(inputBuffer)          // ← same buffer, reuse it
            .resize(400, 533, {
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality: 75 })
            .toFile(thumbPath);

        // ── NOW safe to delete the original temp file ──
        try {
            fs.unlinkSync(originalPath);
        } catch (unlinkErr) {
            // If still locked, schedule cleanup (non-blocking)
            console.warn("Could not delete temp file immediately, retrying...");
            setTimeout(() => {
                try { fs.unlinkSync(originalPath); } catch { /* ignore */ }
            }, 1000);
        }

        // Build URLs
        console.log('baseUrl==========>', req)
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        console.log('baseUrl==========>', baseUrl)
        const imageUrl = `${baseUrl}/uploads/products/${optimizedFileName}`;
        const thumbUrl = `${baseUrl}/uploads/products/${thumbFileName}`;

        const stats = fs.statSync(optimizedPath);
        const fileSizeKB = Math.round(stats.size / 1024);

        res.status(201).json({
            success: true,
            message: "Image upload ho gaya! 🎉",
            data: {
                url: imageUrl,
                thumbnail: thumbUrl,
                fileName: optimizedFileName,
                size: `${fileSizeKB} KB`,
            },
        });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch { /* ignore */ }
        }
        next(error);
    }
};

// POST /api/upload/multiple
export const uploadMultipleImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Koi images select nahi ki!",
            });
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const uploadedImages = [];

        for (const file of req.files) {
            const baseName = `poster-${Date.now()}-${Math.random().toString(36).substring(7)}`;
            const optimizedFileName = `${baseName}.webp`;
            const optimizedPath = path.join(UPLOAD_DIR, optimizedFileName);

            // ── Buffer approach for each file ──
            const inputBuffer = fs.readFileSync(file.path);

            await sharp(inputBuffer)
                .resize(1200, 1600, { fit: "inside", withoutEnlargement: true })
                .webp({ quality: 85 })
                .toFile(optimizedPath);

            try { fs.unlinkSync(file.path); } catch { /* retry later */ }

            uploadedImages.push({
                url: `${baseUrl}/uploads/products/${optimizedFileName}`,
                fileName: optimizedFileName,
            });
        }

        res.status(201).json({
            success: true,
            message: `${uploadedImages.length} images upload ho gayi! 🎉`,
            data: uploadedImages,
        });
    } catch (error) {
        if (req.files) {
            req.files.forEach((file) => {
                try { if (fs.existsSync(file.path)) fs.unlinkSync(file.path); } catch { /* ignore */ }
            });
        }
        next(error);
    }
};

// DELETE stays the same
export const deleteImage = async (req, res, next) => {
    try {
        const { fileName } = req.params;
        const safeName = path.basename(fileName);
        const filePath = path.join(UPLOAD_DIR, safeName);
        const thumbPath = path.join(UPLOAD_DIR, safeName.replace(".webp", "-thumb.webp"));

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);

        res.json({ success: true, message: "Image delete ho gayi!" });
    } catch (error) {
        next(error);
    }
};