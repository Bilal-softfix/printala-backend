import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendOrderConfirmation } from "../utils/sendEmail.js";

// POST /api/orders — Create new order
export const createOrder = async (req, res, next) => {
    try {
        const { items, shipping, paymentMethod = "cod" } = req.body;

        // Validate items exist in database and get current prices
        const orderItems = [];
        let subtotal = 0;

        for (const item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.product}`,
                });
            }

            if (!product.inStock) {
                return res.status(400).json({
                    success: false,
                    message: `"${product.name}" is out of stock`,
                });
            }

            // Find the selected size
            const selectedSize = product.sizes.find((s) => s.label === item.size);
            if (!selectedSize) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid size "${item.size}" for "${product.name}"`,
                });
            }

            const itemPrice = product.price + selectedSize.priceModifier;
            const lineTotal = itemPrice * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.image,
                price: itemPrice,
                size: selectedSize.label,
                dimensions: selectedSize.dimensions,
                quantity: item.quantity,
            });

            subtotal += lineTotal;
        }

        // Calculate shipping
        const shippingCost = subtotal >= 499 ? 0 : 49;
        const total = subtotal + shippingCost;

        // Create order
        const order = await Order.create({
            items: orderItems,
            shipping,
            subtotal,
            shippingCost,
            total,
            paymentMethod,
            paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
            orderStatus: "placed",
        });

        // Send confirmation email (non-blocking)
        sendOrderConfirmation(order);

        res.status(201).json({
            success: true,
            message: "Order placed successfully! 🎉",
            data: {
                orderNumber: order.orderNumber,
                total: order.total,
                paymentMethod: order.paymentMethod,
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/orders/:orderNumber — Get order by order number
export const getOrderByNumber = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            orderNumber: req.params.orderNumber.toUpperCase(),
        }).populate("items.product", "name image slug");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found. Check your order number.",
            });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// GET /api/orders/track/:orderNumber — Simple tracking
export const trackOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            orderNumber: req.params.orderNumber.toUpperCase(),
        }).select("orderNumber orderStatus paymentStatus trackingNumber createdAt");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// GET /api/orders — Get all orders (admin)
export const getAllOrders = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status) filter.orderStatus = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [orders, total] = await Promise.all([
            Order.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Order.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: orders,
            pagination: {
                page: parseInt(page),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

// PUT /api/orders/:id/status — Update order status (admin)
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus, trackingNumber } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                orderStatus,
                ...(trackingNumber && { trackingNumber }),
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};