import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateTotals, evaluateCoupon, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "../src/utils/pricing.js";

const coupon = overrides => ({ active: true, type: "percent", value: 10, minOrder: 0, maxDiscount: 0, usedCount: 0, usageLimit: 0, ...overrides })

test("percent coupon takes the right amount off", () => {
    const result = evaluateCoupon(coupon({ value: 10 }), 2000)
    assert.equal(result.valid, true)
    assert.equal(result.discount, 200)
})

test("percent coupon respects maxDiscount", () => {
    assert.equal(evaluateCoupon(coupon({ value: 50, maxDiscount: 300 }), 2000).discount, 300)
})

test("flat coupon never exceeds the subtotal", () => {
    assert.equal(evaluateCoupon(coupon({ type: "flat", value: 5000 }), 1200).discount, 1200)
})

test("coupon rejected when inactive, expired, exhausted or below minimum", () => {
    assert.equal(evaluateCoupon(null, 1000).valid, false)
    assert.equal(evaluateCoupon(coupon({ active: false }), 1000).valid, false)
    assert.equal(evaluateCoupon(coupon({ expiresAt: new Date("2020-01-01") }), 1000).valid, false)
    assert.equal(evaluateCoupon(coupon({ usageLimit: 5, usedCount: 5 }), 1000).valid, false)
    assert.equal(evaluateCoupon(coupon({ minOrder: 3000 }), 1000).valid, false)
})

test("shipping is charged below the free-shipping threshold and free above it", () => {
    assert.equal(calculateTotals({ subtotal: 1000 }).shipping, SHIPPING_FEE)
    assert.equal(calculateTotals({ subtotal: 1000 }).total, 1000 + SHIPPING_FEE)
    assert.equal(calculateTotals({ subtotal: FREE_SHIPPING_THRESHOLD }).shipping, 0)
})

test("free shipping is judged after the discount is applied", () => {
    const totals = calculateTotals({ subtotal: 2100, discount: 300 })
    assert.equal(totals.shipping, SHIPPING_FEE)
    assert.equal(totals.total, 1800 + SHIPPING_FEE)
})
