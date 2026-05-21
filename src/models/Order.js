import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: String,
        image: String,
        price: { type: Number, required: true },
        size: { type: String, required: true },
        dimensions: String,
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const shippingSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            unique: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (v) => v.length > 0,
                message: "Order must have at least one item",
            },
        },
        shipping: {
            type: shippingSchema,
            required: true,
        },
        subtotal: { type: Number, required: true },
        shippingCost: { type: Number, default: 0 },
        total: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: ["razorpay", "cod"],
            default: "cod",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        razorpayOrderId: String,
        razorpayPaymentId: String,
        razorpaySignature: String,
        orderStatus: {
            type: String,
            enum: ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            default: "placed",
        },
        trackingNumber: String,
        notes: String,
    },
    {
        timestamps: true,
    }
);

// Auto-generate order number before saving
orderSchema.pre("save", async function (next) {
    if (!this.orderNumber) {
        const count = await mongoose.model("Order").countDocuments();
        this.orderNumber = `PRT-${String(count + 1001).padStart(6, "0")}`;
    }
    next();
});

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ "shipping.email": 1 });
orderSchema.index({ orderStatus: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;