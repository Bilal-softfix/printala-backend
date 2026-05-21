import Product from "../models/Product.js";

// GET /api/products — Get all products with filters
export const getProducts = async (req, res, next) => {
    try {
        const {
            category,
            type,
            featured,
            bestseller,
            isNew,
            search,
            sort,
            page = 1,
            limit = 20,
        } = req.query;

        // Build filter object
        const filter = {};

        if (category) filter.category = category;
        if (type) filter.type = type;
        if (featured === "true") filter.featured = true;
        if (bestseller === "true") filter.bestseller = true;
        if (isNew === "true") filter.isNew = true;
        if (search) {
            filter.$text = { $search: search };
        }

        // Build sort object
        let sortOption = { updatedAt: -1 }; // Default: newest first
        // if (sort === "price-asc") sortOption = { price: 1 };
        // if (sort === "price-desc") sortOption = { price: -1 };
        // if (sort === "name") sortOption = { name: 1 };
        if (sort === "bestseller") sortOption = { bestseller: -1, updatedAt: -1 };

        // Pagination

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(), // .lean() = faster, returns plain objects
            Product.countDocuments(filter),
        ]);


        res.json({
            success: true,
            data: products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/products/:id — Get single product
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// GET /api/products/slug/:slug — Get product by slug
export const getProductBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug }).lean();

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// GET /api/products/categories — Get all categories with counts
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        res.json({
            success: true,
            data: categories.map((c) => ({ name: c._id, count: c.count })),
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/products/related/:id — Get related products
export const getRelatedProducts = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id }, // Exclude current product
        })
            .limit(4)
            .lean();

        res.json({ success: true, data: related });
    } catch (error) {
        next(error);
    }
};

// POST /api/products — Create product (admin)
export const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// PUT /api/products/:id — Update product (admin)
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Return updated doc + validate
        );

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/products/:id — Delete product (admin)
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product deleted" });
    } catch (error) {
        next(error);
    }
};