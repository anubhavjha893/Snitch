import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import addressRouter from "./routes/address.routes.js";
import couponRouter from "./routes/coupon.routes.js";
import orderRouter from "./routes/order.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { config } from "./config/config.js";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [ "http://localhost:5173", config.FRONTEND_URL ].filter(Boolean);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    methods: [ "GET", "POST", "PUT", "PATCH", "DELETE" ],
    credentials: true
}))


app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}))

app.get("/", (_req, res) => {
    res.status(200).json({ message: "Server is running" });
});

const limiter = (windowMinutes, max, message) => rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message, success: false }
});

// brute-force protection on credential endpoints, plus a generous cap on everything else
app.use("/api/auth/login", limiter(15, 20, "Too many login attempts. Please try again in a few minutes."));
app.use("/api/auth/register", limiter(60, 20, "Too many sign-up attempts. Please try again later."));
app.use("/api/auth/forgot-password", limiter(60, 5, "Too many reset requests. Please try again later."));
app.use("/api/auth/reset-password", limiter(60, 10, "Too many attempts. Please try again later."));
app.use("/api", limiter(1, 300, "Too many requests. Please slow down."));

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/orders", orderRouter);

app.use("/api", (_req, res) => {
    res.status(404).json({ message: "Route not found", success: false });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    console.error(err);

    if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid ID", success: false });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Each image must be 5MB or smaller", success: false });
    }

    res.status(err.status || 500).json({
        message: config.NODE_ENV === "production" ? "Something went wrong" : err.message,
        success: false
    });
});

export default app;
