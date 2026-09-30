import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import crypto from "node:crypto";
import { sendPasswordResetEmail } from "../services/mail.service.js";
import { config } from "../config/config.js";


async function sendTokenResponse(user, res, message) {

    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/"
    })

    res.status(200).json({
        message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })

}


export const register = async (req, res) => {
    const { email, contact, password, fullname, isSeller } = req.body;

    try {
        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { contact }
            ]
        })

        if (existingUser) {
            return res.status(400).json({ message: "User with this email or contact already exists" });
        }

        const user = await userModel.create({
            email,
            contact,
            password,
            fullname,
            role: isSeller ? "seller" : "buyer"
        })

        await sendTokenResponse(user, res, "User registered successfully")

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error" });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    await sendTokenResponse(user, res, "User logged in successfully")
}

export const googleCallback = async (req, res) => {
    const { id, displayName, emails, photos } = req.user
    const email = emails[ 0 ].value;
    const profilePic = photos[ 0 ].value;


    let user = await userModel.findOne({
        email
    })

    if (!user) {
        user = await userModel.create({
            email,
            googleId: id,
            fullname: displayName,
        })
    }


    const token = jwt.sign({
        id: user._id,
    }, config.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/"
    })

    res.redirect(config.NODE_ENV === "development" ? "http://localhost:5173/" : (config.FRONTEND_URL || "/"))
}

export const getMe = async (req, res) => {
    const user = req.user;

    res.status(200).json({
        message: "User fetched successfully",
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullname: user.fullname,
            role: user.role
        }
    })
}

export const logout = (_req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
        secure: config.NODE_ENV === "production",
        path: "/"
    })

    return res.status(200).json({ message: "Logged out successfully", success: true })
}

export const updateProfile = async (req, res) => {
    req.user.fullname = req.body.fullname.trim()
    req.user.contact = req.body.contact.trim()
    await req.user.save()

    return res.status(200).json({
        message: "Profile updated successfully",
        success: true,
        user: {
            id: req.user._id,
            email: req.user.email,
            contact: req.user.contact,
            fullname: req.user.fullname,
            role: req.user.role
        }
    })
}

const hashToken = token => crypto.createHash("sha256").update(token).digest("hex")

export const forgotPassword = async (req, res) => {
    const email = String(req.body.email || "").trim()

    // always answer the same way so the endpoint cannot be used to discover which emails exist
    const reply = () => res.status(200).json({
        success: true,
        message: "If an account exists for that email, a reset link is on its way."
    })

    const user = await userModel.findOne({ email })

    if (!user) return reply()

    const token = crypto.randomBytes(32).toString("hex")

    user.resetPasswordToken = hashToken(token)
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000)
    await user.save({ validateBeforeSave: false })

    const baseUrl = config.NODE_ENV === "development" ? "http://localhost:5173" : (config.FRONTEND_URL || "")

    await sendPasswordResetEmail(user, `${baseUrl}/reset-password?token=${token}`)

    return reply()
}

export const resetPassword = async (req, res) => {
    const { token, password } = req.body

    if (!token || typeof password !== "string" || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long", success: false })
    }

    const user = await userModel.findOne({
        resetPasswordToken: hashToken(String(token)),
        resetPasswordExpires: { $gt: new Date() }
    }).select("+resetPasswordToken +resetPasswordExpires")

    if (!user) {
        return res.status(400).json({ message: "This reset link is invalid or has expired", success: false })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return res.status(200).json({ success: true, message: "Password updated. You can sign in now." })
}
