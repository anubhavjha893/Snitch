import productModel from "../models/product.model.js";
import reviewModel from "../models/review.model.js";
import paymentModel from "../models/payment.model.js";
import cartModel from "../models/cart.model.js";
import userModel from "../models/user.model.js";
import { uploadFile } from "../services/storage.service.js";


export async function createProduct(req, res) {

    const { title, description, priceAmount, priceCurrency } = req.body;
    const seller = req.user;

    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))


    const product = await productModel.create({
        title,
        description,
        price: {
            amount: priceAmount,
            currency: priceCurrency || "INR"
        },
        images,
        seller: seller._id
    })


    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })
}

export async function getSellerProducts(req, res) {
    const seller = req.user;

    const products = await productModel.find({ seller: seller._id });


    res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products
    })
}

export async function getAllProducts(req, res) {
    const [ products, ratings ] = await Promise.all([
        productModel.find().sort({ createdAt: -1 }).lean(),
        reviewModel.aggregate([
            { $group: { _id: "$product", average: { $avg: "$rating" }, count: { $sum: 1 } } }
        ])
    ])

    const ratingByProduct = new Map(ratings.map(item => [ item._id.toString(), item ]))

    return res.status(200).json({
        message: "Products fetched successfully",
        success: true,
        products: products.map(product => {
            const rating = ratingByProduct.get(product._id.toString())
            return {
                ...product,
                rating: rating ? { average: Math.round(rating.average * 10) / 10, count: rating.count } : { average: 0, count: 0 }
            }
        })
    })
}

export async function getProductDetails(req, res) {
    const { id } = req.params;

    const product = await productModel.findById(id)

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    return res.status(200).json({
        message: "Product details fetched successfully",
        success: true,
        product
    })
}


export async function addProductVariant(req, res) {

    const productId = req.params.productId;

    const product = await productModel.findOne({
        _id: productId,
        seller: req.user._id
    });

    if (!product) {
        return res.status(404).json({
            message: "Product not found",
            success: false
        })
    }

    const files = req.files;
    const images = [];
    if (files && files.length !== 0) {
        (await Promise.all(files.map(async (file) => {
            const image = await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
            return image
        }))).map(image => images.push(image))
    }

    const price = req.body.priceAmount
    const stock = req.body.stock
    const attributes = JSON.parse(req.body.attributes || "{}")

    product.variants.push({
        images,
        price: {
            amount: Number(price) || product.price.amount,
            currency: req.body.priceCurrency || product.price.currency
        },
        stock: Number(stock) || 0,
        attributes
    })

    await product.save();

    return res.status(200).json({
        message: "Product variant added successfully",
        success: true,
        product
    })

}

export async function updateProductVariantStock(req, res) {
    const { productId, variantId } = req.params;
    const stock = Number(req.body.stock);

    const product = await productModel.findOne({ _id: productId, seller: req.user._id });
    const variant = product?.variants.id(variantId);

    if (!variant) {
        return res.status(404).json({ message: "Product variant not found", success: false });
    }

    variant.stock = stock;
    await product.save();

    return res.status(200).json({
        message: "Stock updated successfully",
        success: true,
        stock: variant.stock
    });
}

export async function updateProduct(req, res) {
    const { title, description, priceAmount } = req.body;

    const product = await productModel.findOne({ _id: req.params.productId, seller: req.user._id });

    if (!product) {
        return res.status(404).json({ message: "Product not found", success: false })
    }

    if (title !== undefined) product.title = title
    if (description !== undefined) product.description = description
    if (priceAmount !== undefined) product.price.amount = Number(priceAmount)

    await product.save()

    return res.status(200).json({ message: "Product updated successfully", success: true, product })
}

export async function deleteProduct(req, res) {
    const product = await productModel.findOneAndDelete({ _id: req.params.productId, seller: req.user._id });

    if (!product) {
        return res.status(404).json({ message: "Product not found", success: false })
    }

    await Promise.all([
        reviewModel.deleteMany({ product: product._id }),
        cartModel.updateMany({}, { $pull: { items: { product: product._id } } }),
        userModel.updateMany({}, { $pull: { wishlist: product._id } })
    ])

    return res.status(200).json({ message: "Product deleted successfully", success: true })
}

const summarize = reviews => {
    const count = reviews.length
    const average = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0
    return { count, average: Math.round(average * 10) / 10 }
}

export async function getProductReviews(req, res) {
    const reviews = await reviewModel.find({ product: req.params.productId }).sort({ createdAt: -1 }).lean()

    return res.status(200).json({ success: true, reviews, summary: summarize(reviews) })
}

export async function addProductReview(req, res) {
    const { productId } = req.params
    const rating = Number(req.body.rating)
    const comment = String(req.body.comment || "").trim().slice(0, 1000)

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5", success: false })
    }

    if (!(await productModel.exists({ _id: productId }))) {
        return res.status(404).json({ message: "Product not found", success: false })
    }

    const verifiedPurchase = !!(await paymentModel.exists({
        user: req.user._id,
        status: "paid",
        "orderItems.productId": productId
    }))

    const review = await reviewModel.findOneAndUpdate(
        { product: productId, user: req.user._id },
        { rating, comment, userName: req.user.fullname, verifiedPurchase },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({ message: "Review saved", success: true, review })
}

export async function deleteProductReview(req, res) {
    await reviewModel.deleteOne({ product: req.params.productId, user: req.user._id })

    return res.status(200).json({ message: "Review deleted", success: true })
}
