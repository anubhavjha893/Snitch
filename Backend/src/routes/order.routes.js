import express from "express";
import { authenticateSeller, authenticateUser } from "../middlewares/auth.middleware.js";
import { cancelOrder, getSellerAnalytics, getSellerOrders, requestReturn, updateOrderStatus } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/seller", authenticateSeller, getSellerOrders)

router.get("/seller/analytics", authenticateSeller, getSellerAnalytics)

router.patch("/seller/:orderId/status", authenticateSeller, updateOrderStatus)

router.post("/:orderId/cancel", authenticateUser, cancelOrder)

router.post("/:orderId/return", authenticateUser, requestReturn)

export default router;
