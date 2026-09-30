import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";

const router = express.Router();

router.get("/", authenticateUser, getWishlist)

router.post("/:productId", authenticateUser, addToWishlist)

router.delete("/:productId", authenticateUser, removeFromWishlist)

export default router;
