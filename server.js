import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import adminRoutes from "./src/routes/adminRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";

// Load environment variables FIRST
dotenv.config();

// Import our stuff
import connectDB from "./src/config/db.js";
import errorHandler from "./src/middleware/errorHandler.js";
import productRoutes from "./src/routes/productRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
// import paymentRoutes from "./src/routes/paymentRoutes.js";
import contactRoutes from "./src/routes/contactRoutes.js";
import newsletterRoutes from "./src/routes/newsletterRoutes.js";

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// ─── Connect to MongoDB ───
connectDB();

// ─── Middleware (runs on EVERY request) ───

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS — Allow frontend to talk to us
app.use(
    cors({
        origin: true,
        // process.env.FRONTEND_URL || "http://localhost:3001",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Compress responses (makes them smaller = faster)
app.use(compression());

// Parse JSON body (like when frontend sends form data)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/upload", uploadRoutes);
// Parse cookies
app.use(cookieParser());

// Request logging (shows each request in terminal)
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// Serve uploaded images as static files
// Frontend can access: http://localhost:5000/uploads/products/image.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── API Routes ───
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
// app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/admin", adminRoutes);

// ─── Health Check Route ───
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "🚀 Printala API is running!",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ─── 404 Handler (no route matched) ───
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ─── Error Handler (catches all errors) ───
app.use(errorHandler);

// ─── Start Server ───
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("");
    console.log("╔═════════════════════════════════════════════════════════════════╗");
    console.log("║                                                                 ║");
    console.log("║   🖨️  PRINTALA API SERVER                                      ║");
    console.log(`║   🚀 Running on port ${PORT}                                   ║`);
    console.log(`║   📦 Mode: ${process.env.NODE_ENV || "development"}            ║`);
    console.log("║                                                                 ║");
    console.log("╚═════════════════════════════════════════════════════════════════╝");
    console.log("");
    console.log(`   API:     http://localhost:${PORT}/api`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
    console.log("");
});