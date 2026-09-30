import express from "express";
import { authenticateSeller, authenticateUser } from "../middlewares/auth.middleware.js";
import { createCoupon, deleteCoupon, listCoupons, toggleCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/validate", authenticateUser, validateCoupon)

router.get("/", authenticateSeller, listCoupons)

router.post("/", authenticateSeller, createCoupon)

router.patch("/:couponId/toggle", authenticateSeller, toggleCoupon)

router.delete("/:couponId", authenticateSeller, deleteCoupon)

export default router;
