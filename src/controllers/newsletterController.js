import Newsletter from "../models/Newsletter.js";

// POST /api/newsletter
export const subscribe = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Check if already subscribed
        const existing = await Newsletter.findOne({ email: email.toLowerCase() });

        if (existing) {
            if (existing.active) {
                return res.json({
                    success: true,
                    message: "Tum already subscribed ho! 😊",
                });
            }
            // Re-activate
            existing.active = true;
            await existing.save();
            return res.json({
                success: true,
                message: "Welcome back! Resubscribed 🎉",
            });
        }

        await Newsletter.create({ email: email.toLowerCase() });

        res.status(201).json({
            success: true,
            message: "Welcome to the Printala family! 🎉",
        });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/newsletter/:email — Unsubscribe
export const unsubscribe = async (req, res, next) => {
    try {
        const subscriber = await Newsletter.findOneAndUpdate(
            { email: req.params.email.toLowerCase() },
            { active: false },
            { new: true }
        );

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: "Email not found in subscribers",
            });
        }

        res.json({
            success: true,
            message: "Unsubscribed successfully. We'll miss you! 😢",
        });
    } catch (error) {
        next(error);
    }
};
// GET /api/newsletter — Get all subscribers (admin)
export const getSubscribers = async (req, res, next) => {
    try {
        const subscribers = await Newsletter.find()
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: subscribers,
            total: subscribers.length,
        });
    } catch (error) {
        next(error);
    }
};