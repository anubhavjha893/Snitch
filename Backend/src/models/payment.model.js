import mongoose from "mongoose";
import priceSchema from "./price.schema.js";


const paymentSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: [ "pending", "paid", "failed" ],
        default: "pending"
    },
    price: {
        type: priceSchema,
        required: true
    },
    razorpay: {
        orderId: String,
        paymentId: String,
        signature: String
    },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    coupon: {
        code: String,
        discount: Number
    },
    shippingAddress: {
        name: String,
        phone: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String
    },
    orderStatus: {
        type: String,
        enum: [ "placed", "shipped", "delivered", "cancelled", "return_requested", "returned" ],
        default: "placed"
    },
    statusHistory: [
        {
            _id: false,
            status: String,
            note: String,
            at: { type: Date, default: Date.now }
        }
    ],
    deliveredAt: Date,
    cancelReason: String,
    returnReason: String,
    refund: {
        id: String,
        status: String,
        amount: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    orderItems: [
        {
            title: String,
            productId: mongoose.Schema.Types.ObjectId,
            seller: mongoose.Schema.Types.ObjectId,
            variantId: mongoose.Schema.Types.ObjectId,
            attributes: {
                type: Map,
                of: String
            },
            quantity: Number,
            images: [ { url: String } ],
            description: String,
            price: priceSchema
        }
    ]
}, { timestamps: true })


const paymentModel = mongoose.model("payment", paymentSchema)

export default paymentModel;