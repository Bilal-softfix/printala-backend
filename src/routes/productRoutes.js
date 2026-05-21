import { Router } from "express";
import {
    getProducts,
    getProductById,
    getProductBySlug,
    getCategories,
    getRelatedProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";

const router = Router();

// Public routes
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);

// Admin routes (add auth middleware later)
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;