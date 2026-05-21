import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { login, getMe, changePassword } from "../controllers/authController.js";
import { getDashboard } from "../controllers/dashboardController.js";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import {
    getAllOrders,
    updateOrderStatus,
    getOrderByNumber,
} from "../controllers/orderController.js";
import { getContacts } from "../controllers/contactController.js";
import { getSubscribers } from "../controllers/newsletterController.js";

const router = Router();

// Auth
router.post("/login", login);

// Protected routes
router.use(protect);

router.get("/me", getMe);
router.put("/password", changePassword);
router.get("/dashboard", getDashboard);

// Products — NO multer here anymore (upload is separate)
router.get("/products", getProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAllOrders);
router.get("/orders/:orderNumber", getOrderByNumber);
router.put("/orders/:id/status", updateOrderStatus);

// Contacts
router.get("/contacts", getContacts);

// Newsletter
router.get("/newsletter", getSubscribers);

export default router;