import { Router } from "express";
import { body } from "express-validator";
import { submitContact, getContacts } from "../controllers/contactController.js";

const router = Router();

router.post(
    "/",
    [
        body("name").notEmpty().withMessage("Name required"),
        body("email").isEmail().withMessage("Valid email required"),
        body("subject").notEmpty().withMessage("Subject required"),
        body("message").notEmpty().withMessage("Message required"),
    ],
    submitContact
);

// Admin
router.get("/", getContacts);

export default router;