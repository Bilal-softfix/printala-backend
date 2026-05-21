import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "./src/models/Admin.js";

dotenv.config();

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Check if admin exists
        const existing = await Admin.findOne({ email: "admin@printala.in" });
        if (existing) {
            console.log("⚠️  Admin already exists. Skipping.");
            await mongoose.disconnect();
            process.exit(0);
        }

        const admin = await Admin.create({
            name: "Printala Admin",
            email: "admin@printala.in",
            password: "admin123456",   // CHANGE THIS!
            role: "superadmin",
        });

        console.log("\n✅ Admin created successfully!");
        console.log("╔════════════════════════════════════╗");
        console.log("║  Admin Login Credentials           ║");
        console.log("╠════════════════════════════════════╣");
        console.log(`║  Email:    ${admin.email}    ║`);
        console.log("║  Password: admin123456             ║");
        console.log("║                                    ║");
        console.log("║  ⚠️  CHANGE PASSWORD AFTER LOGIN!  ║");
        console.log("╚════════════════════════════════════╝");

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed:", error.message);
        process.exit(1);
    }
}

seedAdmin();