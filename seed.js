import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./src/models/Product.js";

dotenv.config();

const REGULAR_SIZES = [
    { label: "A4", dimensions: "21 × 29.7 cm", priceModifier: 0 },
    { label: "A3", dimensions: "29.7 × 42 cm", priceModifier: 100 },
    { label: "A2", dimensions: "42 × 59.4 cm", priceModifier: 250 },
    { label: "A1", dimensions: "59.4 × 84.1 cm", priceModifier: 450 },
];

const SPLIT_SIZES = [
    { label: "Small", dimensions: "Each panel 20 × 40 cm", priceModifier: 0 },
    { label: "Medium", dimensions: "Each panel 30 × 60 cm", priceModifier: 400 },
    { label: "Large", dimensions: "Each panel 40 × 80 cm", priceModifier: 800 },
];

const products = [
    {
        name: "Naruto Uzumaki — Sage Mode",
        slug: "naruto-sage-mode",
        description: "Dattebayo! The OG hokage-in-making in his legendary sage mode. Premium 300gsm matte print.",
        price: 199,
        comparePrice: 399,
        image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80",
        category: "anime",
        tags: ["naruto", "anime", "shonen", "hokage"],
        sizes: REGULAR_SIZES,
        type: "poster",
        inStock: true,
        featured: true,
        bestseller: true,
    },
    {
        name: "Jujutsu Kaisen — Gojo Satoru",
        slug: "jjk-gojo-satoru",
        description: "The strongest sorcerer. Gojo's blindfold reveal moment in stunning detail.",
        price: 199,
        image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=800&q=80",
        category: "anime",
        tags: ["jujutsu kaisen", "gojo", "jjk"],
        sizes: REGULAR_SIZES,
        type: "poster",
        inStock: true,
        featured: true,
        bestseller: true,
    },
    {
        name: "GTA Vice City — Neon Retro",
        slug: "gta-vice-city-neon",
        description: "Tommy Vercetti vibes. The iconic Vice City neon skyline.",
        price: 199,
        comparePrice: 349,
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
        category: "gaming",
        tags: ["gta", "vice city", "gaming", "retro"],
        sizes: REGULAR_SIZES,
        type: "poster",
        inStock: true,
        featured: true,
        bestseller: true,
    },
    {
        name: "MS Dhoni — Helicopter Shot",
        slug: "dhoni-helicopter-shot",
        description: "Thala for a reason! Captain Cool's legendary helicopter shot.",
        price: 149,
        image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
        category: "cricket",
        tags: ["dhoni", "msd", "csk", "thala"],
        sizes: REGULAR_SIZES,
        type: "poster",
        inStock: true,
        featured: true,
        bestseller: true,
    },
    {
        name: "Virat Kohli — King's Celebration",
        slug: "virat-kohli-celebration",
        description: "King Kohli in his aggressive celebration.",
        price: 149,
        comparePrice: 299,
        image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
        category: "cricket",
        tags: ["virat kohli", "cricket", "india", "rcb"],
        sizes: REGULAR_SIZES,
        type: "poster",
        inStock: true,
        featured: true,
        bestseller: true,
    },
    {
        name: "Lamborghini Aventador — Matte Black",
        slug: "lamborghini-aventador-black",
        description: "The Aventador in menacing matte black.",
        price: 199,
        comparePrice: 349,
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
        category: "cars",
        tags: ["lamborghini", "aventador", "supercar"],
        sizes: REGULAR_SIZES,
        type: "poster",
        inStock: true,
        featured: true,
        bestseller: true,
    },
    {
        name: "KGF — Rocky Bhai",
        slug: "kgf-rocky-bhai",
        description: "Violence... violence... violence. Rocky Bhai in his iconic scene.",
        price: 199,
        comparePrice: 349,
        image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80",
        category: "bollywood",
        tags: ["kgf", "rocky bhai", "yash", "mass"],
        sizes: REGULAR_SIZES,
        type: "poster",
        inStock: true,
        featured: true,
        bestseller: true,
    },
    {
        name: "Messi — World Cup Trophy",
        slug: "messi-world-cup-trophy",
        description: "Leo Messi lifting the World Cup. The GOAT moment.",
        price: 199,
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
        category: "football",
        tags: ["messi", "world cup", "argentina", "goat"],
        sizes: REGULAR_SIZES,
        type: "poster",
        inStock: true,
        featured: true,
        bestseller: true,
    },
    {
        name: "Himalayan Sunrise — 5 Panel Split",
        slug: "himalayan-sunrise-5-panel",
        description: "The mighty Himalayas spanning 5 panels.",
        price: 999,
        comparePrice: 1799,
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        category: "split-poster",
        tags: ["split poster", "5 panel", "himalaya"],
        sizes: SPLIT_SIZES,
        type: "split-poster",
        panels: 5,
        inStock: true,
        featured: true,
        bestseller: true,
    },
    {
        name: "Mumbai Skyline — 3 Panel Split",
        slug: "mumbai-skyline-3-panel",
        description: "Maximum City at midnight across 3 panels.",
        price: 799,
        comparePrice: 1299,
        image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80",
        category: "split-poster",
        tags: ["split poster", "3 panel", "mumbai"],
        sizes: SPLIT_SIZES,
        type: "split-poster",
        panels: 3,
        inStock: true,
        featured: true,
        bestseller: true,
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing products
        await Product.deleteMany({});
        console.log("🗑️  Cleared existing products");

        // Insert new products
        const created = await Product.insertMany(products);
        console.log(`✅ Seeded ${created.length} products`);

        console.log("\n📋 Created products:");
        created.forEach((p) => {
            console.log(`   • ${p.name} — ₹${p.price} (${p._id})`);
        });

        await mongoose.disconnect();
        console.log("\n✅ Done! Database seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error.message);
        process.exit(1);
    }
}

seed();