import Razorpay from "razorpay"
import { config } from "../config/config.js"

const razorpay = new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET
})


export const createOrder = async ({ amount, currency = "INR" }) => {
    const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit
        currency,
    }

    const order = await razorpay.orders.create(options)

    return order
}

/**
 * Refunds a captured payment. Returns { id, status, amount } and never throws,
 * so a gateway hiccup cannot leave an order half-cancelled.
 */
export const refundPayment = async ({ paymentId, amount }) => {
    if (!paymentId) return { status: "no_payment", amount }

    try {
        const refund = await razorpay.payments.refund(paymentId, { amount: Math.round(amount * 100) })
        return { id: refund.id, status: refund.status || "processed", amount }
    } catch (error) {
        console.error("Refund failed:", error?.error?.description || error.message)
        return { status: "failed", amount }
    }
}
