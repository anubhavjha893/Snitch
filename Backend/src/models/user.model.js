import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const addressSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false }
})

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    contact: { type: String, required: false },
    password: {
        type: String,
        required: function () {
            return !this.googleId;
        }
    },
    fullname: { type: String, required: true },
    role: {
        type: String,
        enum: [ "buyer", "seller" ],
        default: "buyer"
    },
    googleId: {
        type: String,
    },
    addresses: [ addressSchema ],
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    wishlist: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'product' }
    ]
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
})


userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}


const userModel = mongoose.model('user', userSchema);

export default userModel;