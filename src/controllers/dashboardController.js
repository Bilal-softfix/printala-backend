import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Contact from "../models/Contact.js";
import Newsletter from "../models/Newsletter.js";

// GET /api/admin/dashboard
export const getDashboard = async (req, res, next) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Run all queries in parallel
        const [
            totalProducts,
            totalOrders,
            totalRevenue,
            monthlyOrders,
            lastMonthOrders,
            monthlyRevenue,
            lastMonthRevenue,
            pendingOrders,
            totalContacts,
            unreadContacts,
            totalSubscribers,
            recentOrders,
            ordersByStatus,
            topProducts,
            dailyRevenue,
        ] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            Order.aggregate([
                { $match: { paymentStatus: { $in: ["paid", "pending"] } } },
                { $group: { _id: null, total: { $sum: "$total" } } },
            ]),
            Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Order.countDocuments({
                createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            }),
            Order.aggregate([
                { $match: { createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: "$total" } } },
            ]),
            Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
                    },
                },
                { $group: { _id: null, total: { $sum: "$total" } } },
            ]),
            Order.countDocuments({
                orderStatus: { $in: ["placed", "confirmed", "processing"] },
            }),
            Contact.countDocuments(),
            Contact.countDocuments({ status: "new" }),
            Newsletter.countDocuments({ active: true }),
            Order.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .select("orderNumber total orderStatus paymentMethod createdAt shipping.fullName")
                .lean(),
            Order.aggregate([
                { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
            ]),
            Order.aggregate([
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.name",
                        totalSold: { $sum: "$items.quantity" },
                        totalRevenue: {
                            $sum: { $multiply: ["$items.price", "$items.quantity"] },
                        },
                    },
                },
                { $sort: { totalSold: -1 } },
                { $limit: 5 },
            ]),
            Order.aggregate([
                {
                    $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                        },
                        revenue: { $sum: "$total" },
                        orders: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        const revenue = totalRevenue[0]?.total || 0;
        const thisMonthRev = monthlyRevenue[0]?.total || 0;
        const lastMonthRev = lastMonthRevenue[0]?.total || 0;

        const revenueGrowth =
            lastMonthRev > 0
                ? (((thisMonthRev - lastMonthRev) / lastMonthRev) * 100).toFixed(1)
                : 100;

        const orderGrowth =
            lastMonthOrders > 0
                ? (
                    ((monthlyOrders - lastMonthOrders) / lastMonthOrders) *
                    100
                ).toFixed(1)
                : 100;

        res.json({
            success: true,
            data: {
                stats: {
                    totalProducts,
                    totalOrders,
                    totalRevenue: revenue,
                    monthlyOrders,
                    monthlyRevenue: thisMonthRev,
                    pendingOrders,
                    totalContacts,
                    unreadContacts,
                    totalSubscribers,
                    revenueGrowth: parseFloat(revenueGrowth),
                    orderGrowth: parseFloat(orderGrowth),
                },
                recentOrders,
                ordersByStatus: ordersByStatus.reduce(
                    (acc, s) => ({ ...acc, [s._id]: s.count }),
                    {}
                ),
                topProducts,
                dailyRevenue,
            },
        });
    } catch (error) {
        next(error);
    }
};