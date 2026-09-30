import paymentModel from "../models/payment.model.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import { refundPayment } from "../services/payment.service.js";
import { sendOrderStatusEmail } from "../services/mail.service.js";
import { canBuyerCancel, canRequestReturn, canSellerTransition, ORDER_STATUSES } from "../utils/orderStatus.js";
import { serializeOrder } from "./cart.controller.js";

const LOW_STOCK_LIMIT = 5

const restock = payment => Promise.all(payment.orderItems.map(item => productModel.updateOne(
    { _id: item.productId, "variants._id": item.variantId },
    { $inc: { "variants.$.stock": item.quantity } }
)))

const refund = async payment => {
    payment.refund = await refundPayment({ paymentId: payment.razorpay.paymentId, amount: payment.price.amount })
}

const notifyBuyer = async payment => {
    const buyer = await userModel.findById(payment.user)
    if (buyer) await sendOrderStatusEmail(buyer, payment)
}

const sellerProductIds = async sellerId => (await productModel.find({ seller: sellerId }).select("_id").lean()).map(product => product._id)

/* ───────────── Buyer ───────────── */

export const cancelOrder = async (req, res) => {
    const payment = await paymentModel.findOne({ "razorpay.orderId": req.params.orderId, user: req.user._id, status: "paid" })

    if (!payment) return res.status(404).json({ message: "Order not found", success: false })

    if (!canBuyerCancel(payment.orderStatus)) {
        return res.status(400).json({ message: "This order can no longer be cancelled", success: false })
    }

    payment.orderStatus = "cancelled"
    payment.cancelReason = String(req.body.reason || "").trim().slice(0, 300)
    payment.statusHistory.push({ status: "cancelled", note: payment.cancelReason || "Cancelled by customer" })

    await restock(payment)
    await refund(payment)
    await payment.save()

    return res.status(200).json({ success: true, message: "Order cancelled. Your refund is on its way.", order: serializeOrder(payment.toObject()) })
}

export const requestReturn = async (req, res) => {
    const payment = await paymentModel.findOne({ "razorpay.orderId": req.params.orderId, user: req.user._id, status: "paid" })

    if (!payment) return res.status(404).json({ message: "Order not found", success: false })

    if (!canRequestReturn(payment.orderStatus, payment.deliveredAt)) {
        return res.status(400).json({ message: "This order is not eligible for a return", success: false })
    }

    const reason = String(req.body.reason || "").trim().slice(0, 300)

    if (reason.length < 3) return res.status(400).json({ message: "Please tell us why you are returning it", success: false })

    payment.orderStatus = "return_requested"
    payment.returnReason = reason
    payment.statusHistory.push({ status: "return_requested", note: reason })
    await payment.save()

    return res.status(200).json({ success: true, message: "Return requested. We will get back to you shortly.", order: serializeOrder(payment.toObject()) })
}

/* ───────────── Seller ───────────── */

export const getSellerOrders = async (req, res) => {
    const productIds = await sellerProductIds(req.user._id)

    const payments = await paymentModel.find({ status: "paid", "orderItems.productId": { $in: productIds } })
        .sort({ createdAt: -1 })
        .populate("user", "fullname email contact")
        .lean()

    const mine = new Set(productIds.map(String))

    return res.status(200).json({
        success: true,
        orders: payments.map(payment => ({
            ...serializeOrder({ ...payment, orderItems: payment.orderItems.filter(item => mine.has(String(item.productId))) }),
            customer: payment.user ? { name: payment.user.fullname, email: payment.user.email, contact: payment.user.contact } : null,
            returnReason: payment.returnReason,
            cancelReason: payment.cancelReason,
            nextStatuses: ORDER_STATUSES.filter(status => canSellerTransition(payment.orderStatus || "placed", status))
        }))
    })
}

export const updateOrderStatus = async (req, res) => {
    const { status } = req.body

    const payment = await paymentModel.findOne({ "razorpay.orderId": req.params.orderId, status: "paid" })

    if (!payment) return res.status(404).json({ message: "Order not found", success: false })

    const productIds = new Set((await sellerProductIds(req.user._id)).map(String))

    if (!payment.orderItems.some(item => productIds.has(String(item.productId)))) {
        return res.status(403).json({ message: "This order does not contain your products", success: false })
    }

    if (!canSellerTransition(payment.orderStatus, status)) {
        return res.status(400).json({ message: `Cannot move an order from "${payment.orderStatus}" to "${status}"`, success: false })
    }

    payment.orderStatus = status
    payment.statusHistory.push({ status })

    if (status === "delivered") payment.deliveredAt = new Date()

    if (status === "returned") {
        await restock(payment)
        await refund(payment)
    }

    await payment.save()
    await notifyBuyer(payment)

    return res.status(200).json({ success: true, message: `Order marked as ${status.replace("_", " ")}` })
}

export const getSellerAnalytics = async (req, res) => {
    const sellerId = req.user._id
    const productIds = await sellerProductIds(sellerId)
    const since = new Date()
    since.setDate(since.getDate() - 13)
    since.setHours(0, 0, 0, 0)

    const base = [
        { $match: { status: "paid", orderStatus: { $nin: [ "cancelled", "returned" ] }, "orderItems.productId": { $in: productIds } } },
        { $unwind: "$orderItems" },
        { $match: { "orderItems.productId": { $in: productIds } } },
        { $addFields: { lineTotal: { $multiply: [ "$orderItems.price.amount", "$orderItems.quantity" ] } } }
    ]

    const [ totals, daily, top, lowStockProducts, statusCounts ] = await Promise.all([
        paymentModel.aggregate([
            ...base,
            { $group: { _id: null, revenue: { $sum: "$lineTotal" }, units: { $sum: "$orderItems.quantity" }, orders: { $addToSet: "$_id" } } }
        ]),
        paymentModel.aggregate([
            ...base,
            { $match: { createdAt: { $gte: since } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$lineTotal" }, units: { $sum: "$orderItems.quantity" } } }
        ]),
        paymentModel.aggregate([
            ...base,
            { $group: { _id: "$orderItems.productId", title: { $first: "$orderItems.title" }, units: { $sum: "$orderItems.quantity" }, revenue: { $sum: "$lineTotal" } } },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]),
        productModel.find({ seller: sellerId, "variants.stock": { $lte: LOW_STOCK_LIMIT } }).select("title variants").lean(),
        paymentModel.aggregate([
            { $match: { status: "paid", "orderItems.productId": { $in: productIds } } },
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
        ])
    ])

    const dailyMap = new Map(daily.map(day => [ day._id, day ]))
    const last14 = Array.from({ length: 14 }, (_, index) => {
        const date = new Date(since)
        date.setDate(since.getDate() + index)
        const key = date.toISOString().slice(0, 10)
        return { date: key, revenue: dailyMap.get(key)?.revenue || 0, units: dailyMap.get(key)?.units || 0 }
    })

    const lowStock = lowStockProducts.flatMap(product => product.variants
        .filter(variant => variant.stock <= LOW_STOCK_LIMIT)
        .map(variant => ({
            productId: product._id,
            title: product.title,
            attributes: variant.attributes ? Object.fromEntries(Object.entries(variant.attributes)) : {},
            stock: variant.stock
        })))

    return res.status(200).json({
        success: true,
        analytics: {
            revenue: totals[ 0 ]?.revenue || 0,
            units: totals[ 0 ]?.units || 0,
            orders: totals[ 0 ]?.orders.length || 0,
            last14,
            topProducts: top,
            lowStock,
            statusCounts: Object.fromEntries(statusCounts.map(item => [ item._id || "placed", item.count ]))
        }
    })
}
