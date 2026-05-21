import mongoose from "mongoose";

// This defines what a "Product" looks like in the database
const sizeSchema = new mongoose.Schema(
    {
        label: { type: String, required: true },       // "A4", "A3", etc.
        dimensions: { type: String, required: true },   // "21 × 29.7 cm"
        priceModifier: { type: Number, default: 0 },    // Extra cost for bigger sizes
    },
    { _id: false } // Don't create separate IDs for sizes
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        comparePrice: {
            type: Number,
            default: null,
        },
        image: {
            type: String,
            required: [true, "Product image is required"],
        },
        images: [String], // Additional images
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "anime",
                "gaming",
                "cricket",
                "cars",
                "bollywood",
                "football",
                "anime-girls",
                "sports",
                "music",
                "split-poster",
            ],
        },
        tags: [String],
        sizes: {
            type: [sizeSchema],
            required: true,
            validate: {
                validator: (v) => v.length > 0,
                message: "At least one size is required",
            },
        },
        type: {
            type: String,
            enum: ["poster", "split-poster"],
            default: "poster",
        },
        panels: {
            type: Number,
            enum: [2, 3, 5],
            default: null,
        },
        inStock: {
            type: Boolean,
            default: true,
        },
        featured: {
            type: Boolean,
            default: false,
        },
        bestseller: {
            type: Boolean,
            default: false,
        },
        isNew: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// Create search index for text search
productSchema.index({ name: "text", description: "text", tags: "text" });
// Index for common queries
productSchema.index({ category: 1, featured: 1 });
productSchema.index({ bestseller: 1 });
productSchema.index({ slug: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;