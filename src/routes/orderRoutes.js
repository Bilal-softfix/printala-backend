import { Router } from "express";
import { body } from "express-validator";
import {
    createOrder,
    getOrderByNumber,
    trackOrder,
    getAllOrders,
    updateOrderStatus,
} from "../controllers/orderController.js";

const router = Router();

// Validation rules for creating an order
const orderValidation = [
    body("items")
        .isArray({ min: 1 })
        .withMessage("At least one item required"),
    body("items.*.product")
        .notEmpty()
        .withMessage("Product ID required"),
    body("items.*.size")
        .notEmpty()
        .withMessage("Size required"),
    body("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be at least 1"),
    body("shipping.fullName")
        .notEmpty()
        .withMessage("Name required"),
    body("shipping.email")
        .isEmail()
        .withMessage("Valid email required"),
    body("shipping.phone")
        .notEmpty()
        .withMessage("Phone required"),
    body("shipping.address")
        .notEmpty()
        .withMessage("Address required"),
    body("shipping.city")
        .notEmpty()
        .withMessage("City required"),
    body("shipping.state")
        .notEmpty()
        .withMessage("State required"),
    body("shipping.pincode")
        .matches(/^[1-9][0-9]{5}$/)
        .withMessage("Valid 6-digit pincode required"),
];

// Public routes
router.post("/", orderValidation, createOrder);
router.get("/track/:orderNumber", trackOrder);
router.get("/:orderNumber", getOrderByNumber);

// Admin routes
router.get("/", getAllOrders);
router.put("/:id/status", updateOrderStatus);

export default router;