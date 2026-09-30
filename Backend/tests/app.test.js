import { test, before, after } from "node:test";
import assert from "node:assert/strict";

// config.js refuses to load without these; dummy values are fine because these tests never touch the DB
const dummyEnv = {
    MONGO_URI: "mongodb://localhost:27017/test", JWT_SECRET: "test", GOOGLE_CLIENT_ID: "x", GOOGLE_CLIENT_SECRET: "x",
    IMAGEKIT_PRIVATE_KEY: "x", RAZORPAY_KEY_ID: "x", RAZORPAY_KEY_SECRET: "x", NODE_ENV: "test"
}
for (const [ key, value ] of Object.entries(dummyEnv)) process.env[ key ] = process.env[ key ] || value

let server, base

before(async () => {
    const { default: app } = await import("../src/app.js")
    server = app.listen(0)
    base = `http://127.0.0.1:${server.address().port}`
})

after(() => server.close())

test("health route responds", async () => {
    const response = await fetch(`${base}/`)
    assert.equal(response.status, 200)
})

test("unknown api routes return a JSON 404", async () => {
    const response = await fetch(`${base}/api/does-not-exist`)
    assert.equal(response.status, 404)
    assert.equal((await response.json()).success, false)
})

test("protected routes reject anonymous users", async () => {
    for (const path of [ "/api/wishlist", "/api/addresses", "/api/cart/orders", "/api/orders/seller" ]) {
        const response = await fetch(`${base}${path}`)
        assert.equal(response.status, 401, path)
    }
})

test("security headers are set", async () => {
    const response = await fetch(`${base}/`)
    assert.ok(response.headers.get("x-content-type-options"))
})

test("rate limit headers are exposed on api routes", async () => {
    const response = await fetch(`${base}/api/does-not-exist`)
    assert.ok(response.headers.get("ratelimit") || response.headers.get("ratelimit-policy"))
})
