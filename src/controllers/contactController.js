import Contact from "../models/Contact.js";
import { sendContactNotification } from "../utils/sendEmail.js";

// POST /api/contact
export const submitContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        const contact = await Contact.create({ name, email, subject, message });

        // Notify admin via email
        sendContactNotification(contact);

        res.status(201).json({
            success: true,
            message: "Message received! We will get back to you soon",
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/contact — Get all messages (admin)
export const getContacts = async (req, res, next) => {
    try {
        const contacts = await Contact.find()
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, data: contacts });
    } catch (error) {
        next(error);
    }
};