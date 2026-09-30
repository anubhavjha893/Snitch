import { test } from "node:test";
import assert from "node:assert/strict";
import { canBuyerCancel, canRequestReturn, canSellerTransition } from "../src/utils/orderStatus.js";

test("seller can only move orders forward", () => {
    assert.equal(canSellerTransition("placed", "shipped"), true)
    assert.equal(canSellerTransition("shipped", "delivered"), true)
    assert.equal(canSellerTransition("placed", "delivered"), false)
    assert.equal(canSellerTransition("delivered", "placed"), false)
    assert.equal(canSellerTransition("cancelled", "shipped"), false)
})

test("seller can resolve a return request", () => {
    assert.equal(canSellerTransition("return_requested", "returned"), true)
    assert.equal(canSellerTransition("return_requested", "delivered"), true)
})

test("buyer can cancel only before shipping", () => {
    assert.equal(canBuyerCancel("placed"), true)
    assert.equal(canBuyerCancel("shipped"), false)
})

test("returns are allowed for 14 days after delivery only", () => {
    const now = new Date("2026-01-20")
    assert.equal(canRequestReturn("delivered", new Date("2026-01-10"), now), true)
    assert.equal(canRequestReturn("delivered", new Date("2026-01-01"), now), false)
    assert.equal(canRequestReturn("shipped", new Date("2026-01-10"), now), false)
    assert.equal(canRequestReturn("delivered", null, now), false)
})
