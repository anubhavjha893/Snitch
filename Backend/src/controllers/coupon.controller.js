import couponModel from "../models/coupon.model.js";
import { getCartDetails } from "../dao/cart.dao.js";
import { calculateTotals, evaluateCoupon } from "../utils/pricing.js";

// Buyer: check a code against their current cart
export const validateCoupon = async (req, res) => {
    const code = String(req.body.code || "").trim().toUpperCase()

    if (!code) return res.status(400).json({ message: "Enter a coupon code", success: false })

    const cart = await getCartDetails(req.user._id)

    if (!cart || !cart.items.length) {
        return res.status(400).json({ message: "Your cart is empty", success: false })
    }

    const coupon = await couponModel.findOne({ code })
    const result = evaluateCoupon(coupon, cart.totalPrice)

    if (!result.valid) return res.status(400).json({ message: result.reason, success: false })

    return res.status(200).json({
        success: true,
        message: `${code} applied`,
        coupon: { code, description: coupon.description },
        totals: calculateTotals({ subtotal: cart.totalPrice, discount: result.discount })
    })
}

// Seller: manage coupons
export const listCoupons = async (_req, res) => {
    const coupons = await couponModel.find().sort({ createdAt: -1 })
    return res.status(200).json({ success: true, coupons })
}

export const createCoupon = async (req, res) => {
    const { code, description, type, value, minOrder, maxDiscount, expiresAt, usageLimit } = req.body
    const normalized = String(code || "").trim().toUpperCase()

    if (!/^[A-Z0-9]{3,20}$/.test(normalized)) {
        return res.status(400).json({ message: "Code must be 3-20 letters or numbers", success: false })
    }
    if (![ "percent", "flat" ].includes(type)) {
        return res.status(400).json({ message: "Type must be percent or flat", success: false })
    }
    if (!(Number(value) > 0) || (type === "percent" && Number(value) > 90)) {
        return res.status(400).json({ message: type === "percent" ? "Percent must be between 1 and 90" : "Value must be greater than 0", success: false })
    }
    if (await couponModel.exists({ code: normalized })) {
        return res.status(400).json({ message: "A coupon with this code already exists", success: false })
    }

    const coupon = await couponModel.create({
        code: normalized,
        description,
        type,
        value: Number(value),
        minOrder: Number(minOrder) || 0,
        maxDiscount: Number(maxDiscount) || 0,
        usageLimit: Number(usageLimit) || 0,
        expiresAt: expiresAt ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(expiresAt) ? `${expiresAt}T23:59:59` : expiresAt) : undefined,
        createdBy: req.user._id
    })

    return res.status(201).json({ success: true, message: "Coupon created", coupon })
}

export const toggleCoupon = async (req, res) => {
    const coupon = await couponModel.findById(req.params.couponId)

    if (!coupon) return res.status(404).json({ message: "Coupon not found", success: false })

    coupon.active = !coupon.active
    await coupon.save()

    return res.status(200).json({ success: true, coupon })
}

export const deleteCoupon = async (req, res) => {
    await couponModel.findByIdAndDelete(req.params.couponId)
    return res.status(200).json({ success: true, message: "Coupon deleted" })
}
