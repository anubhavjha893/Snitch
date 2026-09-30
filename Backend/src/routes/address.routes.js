import express from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { addAddress, deleteAddress, getAddresses, updateAddress } from "../controllers/address.controller.js";

const router = express.Router();

router.get("/", authenticateUser, getAddresses)

router.post("/", authenticateUser, addAddress)

router.patch("/:addressId", authenticateUser, updateAddress)

router.delete("/:addressId", authenticateUser, deleteAddress)

export default router;
