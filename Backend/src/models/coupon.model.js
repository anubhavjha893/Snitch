import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true, default: "" },
    type: { type: String, enum: [ "percent", "flat" ], required: true },
    value: { type: Number, required: true, min: 1 },
    minOrder: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date },
    usageLimit: { type: Number, default: 0, min: 0 },
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }
}, { timestamps: true })

const couponModel = mongoose.model("coupon", couponSchema);

export default couponModel;
