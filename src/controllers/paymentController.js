// import Razorpay from "razorpay";
// import crypto from "crypto";
// import Order from "../models/Order.js";

// const razorpay = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// // POST /api/payment/create-order — Create Razorpay order
// export const createRazorpayOrder = async (req, res, next) => {
//     try {
//         const { amount, orderId } = req.body;

//         const options = {
//             amount: Math.round(amount * 100), // Razorpay expects paise (₹199 = 19900)
//             currency: "INR",
//             receipt: orderId || `receipt_${Date.now()}`,
//         };

//         const razorpayOrder = await razorpay.orders.create(options);

//         res.json({
//             success: true,
//             data: {
//                 id: razorpayOrder.id,
//                 amount: razorpayOrder.amount,
//                 currency: razorpayOrder.currency,
//                 key: process.env.RAZORPAY_KEY_ID, // Frontend needs this
//             },
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// // POST /api/payment/verify — Verify Razorpay payment
// export const verifyPayment = async (req, res, next) => {
//     try {
//         const {
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature,
//             orderNumber,
//         } = req.body;

//         // Verify signature (this proves payment is real, not faked)
//         const body = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSignature = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(body)
//             .digest("hex");

//         if (expectedSignature !== razorpay_signature) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment verification failed. Signature mismatch.",
//             });
//         }

//         // Update order with payment details
//         const order = await Order.findOneAndUpdate(
//             { orderNumber },
//             {
//                 paymentStatus: "paid",
//                 razorpayOrderId: razorpay_order_id,
//                 razorpayPaymentId: razorpay_payment_id,
//                 razorpaySignature: razorpay_signature,
//                 orderStatus: "confirmed",
//             },
//             { new: true }
//         );

//         if (!order) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         res.json({
//             success: true,
//             message: "Payment verified successfully! 🎉",
//             data: { orderNumber: order.orderNumber },
//         });
//     } catch (error) {
//         next(error);
//     }
// };