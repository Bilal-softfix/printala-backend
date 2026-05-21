import { Router } from "express";
import { body } from "express-validator";
import { subscribe, unsubscribe } from "../controllers/newsletterController.js";

const router = Router();

router.post(
    "/",
    [body("email").isEmail().withMessage("Valid email chahiye bhai")],
    subscribe
);

router.delete("/:email", unsubscribe);

export default router;