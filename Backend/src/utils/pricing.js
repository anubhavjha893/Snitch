export const FREE_SHIPPING_THRESHOLD = 1999
export const SHIPPING_FEE = 99

const round = value => Math.round(value * 100) / 100

/**
 * Validates a coupon against a subtotal and works out the discount.
 * Pure function so it is easy to unit test.
 */
export function evaluateCoupon(coupon, subtotal, now = new Date()) {
    if (!coupon || !coupon.active) {
        return { valid: false, reason: "This coupon code is not valid", discount: 0 }
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
        return { valid: false, reason: "This coupon has expired", discount: 0 }
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, reason: "This coupon has reached its usage limit", discount: 0 }
    }
    if (coupon.minOrder && subtotal < coupon.minOrder) {
        return { valid: false, reason: `Add items worth ₹${coupon.minOrder} or more to use this coupon`, discount: 0 }
    }

    let discount = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value

    if (coupon.type === "percent" && coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount)
    }

    discount = round(Math.min(discount, subtotal))

    return { valid: true, reason: "", discount }
}

export function calculateTotals({ subtotal, discount = 0 }) {
    const afterDiscount = Math.max(subtotal - discount, 0)
    const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE

    return {
        subtotal: round(subtotal),
        discount: round(discount),
        shipping,
        total: round(afterDiscount + shipping)
    }
}
