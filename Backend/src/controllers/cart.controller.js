import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import mongoose from "mongoose";
import { createOrder } from "../services/payment.service.js";
import { getCartDetails } from "../dao/cart.dao.js";
import paymentModel from "../models/payment.model.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { config } from "../config/config.js";




export const addToCart = async (req, res) => {

    const { productId, variantId } = req.params
    const { quantity = 1 } = req.body

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    })

    if (!product) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        })
    }

    const stock = await stockOfVariant(productId, variantId)

    const cart = (await cartModel.findOne({ user: req.user._id })) ||
        (await cartModel.create({ user: req.user._id }))

    const isProductAlreadyInCart = cart.items.some(item => item.product.toString() === productId && item.variant?.toString() === variantId)

    if (isProductAlreadyInCart) {
        const quantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId).quantity
        if (quantityInCart + quantity > stock) {
            return res.status(400).json({
                message: `Only ${stock} items left in stock. and you already have ${quantityInCart} items in your cart`,
                success: false
            })
        }

        await cartModel.findOneAndUpdate(
            { user: req.user._id, "items.product": productId, "items.variant": variantId },
            { $inc: { "items.$.quantity": quantity } },
            { new: true }
        )

        return res.status(200).json({
            message: "Cart updated successfully",
            success: true
        })
    }

    if (quantity > stock) {
        return res.status(400).json({
            message: `Only ${stock} items left in stock`,
            success: false
        })
    }

    cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price: product.price
    })

    await cart.save()

    return res.status(200).json({
        message: "Product added to cart successfully",
        success: true
    })
}

export const getCart = async (req, res) => {
    const user = req.user

    let cart = await getCartDetails(user._id)

    if (!cart) {
        const existingCart = await cartModel.findOne({ user: user._id })
        if (!existingCart) {
            await cartModel.create({ user: user._id })
        }
        cart = { items: [], totalPrice: 0, currency: "INR" }
    }

    return res.status(200).json({
        message: "Cart fetched successfully",
        success: true,
        cart
    })
}

export const incrementCartItemQuantity = async (req, res) => {
    const { productId, variantId } = req.params

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    })

    if (!product) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        })
    }

    const cart = await cartModel.findOne({ user: req.user._id })

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found",
            success: false
        })
    }

    const stock = await stockOfVariant(productId, variantId)

    const itemQuantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId)?.quantity || 0

    if (itemQuantityInCart + 1 > stock) {
        return res.status(400).json({
            message: `Only ${stock} items left in stock. and you already have ${itemQuantityInCart} items in your cart`,
            success: false
        })
    }

    await cartModel.findOneAndUpdate(
        { user: req.user._id, "items.product": productId, "items.variant": variantId },
        { $inc: { "items.$.quantity": 1 } },
        { new: true }
    )

    return res.status(200).json({
        message: "Cart item quantity incremented successfully",
        success: true
    })
}

export const decrementCartItemQuantity = async (req, res) => {
    const { productId, variantId } = req.params
    const cart = await cartModel.findOne({ user: req.user._id })
    const item = cart?.items.find(cartItem =>
        cartItem.product.toString() === productId && cartItem.variant?.toString() === variantId
    )

    if (!item) {
        return res.status(404).json({ message: "Cart item not found", success: false })
    }

    if (item.quantity <= 1) {
        cart.items.pull({ _id: item._id })
    } else {
        item.quantity -= 1
    }

    await cart.save()
    return res.status(200).json({ message: "Cart quantity updated", success: true })
}

export const removeCartItem = async (req, res) => {
    const { productId, variantId } = req.params
    const cart = await cartModel.findOne({ user: req.user._id })

    if (!cart) {
        return res.status(404).json({ message: "Cart item not found", success: false })
    }

    const item = cart.items.find(cartItem =>
        cartItem.product.toString() === productId && cartItem.variant?.toString() === variantId
    )

    if (!item) {
        return res.status(404).json({ message: "Cart item not found", success: false })
    }

    cart.items.pull({ _id: item._id })
    await cart.save()
    return res.status(200).json({ message: "Item removed from cart", success: true })
}

export const createOrderController = async (req, res) => {


    const cart = await getCartDetails(req.user._id)

    if (!cart) {
        return res.status(400).json({
            message: "Cart is empty",
            success: false
        })
    }

    const order = await createOrder({ amount: cart.totalPrice, currency: cart.currency })

    const payment = await paymentModel.create({
        user: req.user._id,
        razorpay: {
            orderId: order.id,
        },
        price: {
            amount: cart.totalPrice,
            currency: cart.currency
        },
        orderItems: cart.items.map(item => ({
            title: item.product.title,
            productId: item.product._id,
            variantId: item.variant,
            attributes: item.product.variants.attributes,
            quantity: item.quantity,
            images: item.product.variants.images?.length ? item.product.variants.images : item.product.images,
            description: item.product.description,
            price: {
                amount: item.product.variants.price.amount || item.product.price.amount,
                currency: item.product.variants.price.currency || item.product.price.currency
            }
        }))
    })

    return res.status(200).json({
        message: "Order created successfully",
        success: true,
        order,
        keyId: config.RAZORPAY_KEY_ID
    })
}

export const verifyOrderController = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body

    const payment = await paymentModel.findOne({
        "razorpay.orderId": razorpay_order_id,
        user: req.user._id,
        status: "pending"
    })

    if (!payment) {
        return res.status(400).json({
            message: "Payment not found",
            success: false
        })
    }

    const isPaymentValid = validatePaymentVerification({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
    }, razorpay_signature, config.RAZORPAY_KEY_SECRET)

    if (!isPaymentValid) {
        payment.status = "failed"
        await payment.save()

        return res.status(400).json({
            message: "Payment verification failed",
            success: false
        })
    }

    payment.status = "paid"

    payment.razorpay.paymentId = razorpay_payment_id
    payment.razorpay.signature = razorpay_signature

    await Promise.all(payment.orderItems.map(item => productModel.updateOne(
        { _id: item.productId, "variants._id": item.variantId },
        { $inc: { "variants.$.stock": -item.quantity } }
    )))

    await payment.save()
    await cartModel.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } })

    return res.status(200).json({
        message: "Payment verified successfully",
        success: true
    })
}

export const getOrderDetails = async (req, res) => {
    const payment = await paymentModel.findOne({
        "razorpay.orderId": req.params.orderId,
        user: req.user._id
    }).lean()

    if (!payment) {
        return res.status(404).json({ message: "Order not found", success: false })
    }

    return res.status(200).json({
        success: true,
        order: {
            status: payment.status,
            orderId: payment.razorpay.orderId,
            items: payment.orderItems.map(item => ({
                ...item,
                attributes: item.attributes && typeof item.attributes[Symbol.iterator] === "function"
                    ? Object.fromEntries(item.attributes)
                    : item.attributes || {}
            })),
            total: payment.price
        }
    })
}