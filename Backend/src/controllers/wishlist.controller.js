import mongoose from "mongoose";
import productModel from "../models/product.model.js";

export const getWishlist = async (req, res) => {
    await req.user.populate("wishlist")

    return res.status(200).json({
        success: true,
        products: req.user.wishlist.filter(Boolean)
    })
}

export const addToWishlist = async (req, res) => {
    const { productId } = req.params

    if (!mongoose.isValidObjectId(productId) || !(await productModel.exists({ _id: productId }))) {
        return res.status(404).json({ message: "Product not found", success: false })
    }

    await req.user.updateOne({ $addToSet: { wishlist: productId } })

    return res.status(200).json({ message: "Added to wishlist", success: true })
}

export const removeFromWishlist = async (req, res) => {
    const { productId } = req.params

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "Invalid product ID", success: false })
    }

    await req.user.updateOne({ $pull: { wishlist: productId } })

    return res.status(200).json({ message: "Removed from wishlist", success: true })
}
