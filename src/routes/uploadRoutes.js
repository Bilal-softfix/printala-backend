import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { handleUploadError, handleMultipleUploadError } from "../middleware/upload.js";
import {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
} from "../controllers/uploadController.js";

const router = Router();

// All upload routes need admin auth
router.use(protect);

// POST /api/upload — Single image
router.post("/", handleUploadError, uploadImage);

// POST /api/upload/multiple — Multiple images
router.post("/multiple", handleMultipleUploadError, uploadMultipleImages);

// DELETE /api/upload/:fileName — Delete image
router.delete("/:fileName", deleteImage);

export default router;