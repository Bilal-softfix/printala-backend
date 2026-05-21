// This catches all errors and sends a clean response
// Instead of your app crashing, it sends a nice error message

const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err.message);

    // Mongoose validation error (e.g., missing required field)
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: messages,
        });
    }

    // Mongoose duplicate key (e.g., same email twice in newsletter)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `This ${field} already exists`,
        });
    }

    // Mongoose bad ObjectId (e.g., invalid product ID)
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format",
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
};

export default errorHandler;