import axios from "axios"

const opts = { withCredentials: true }

export const getSellerOrders = async () => (await axios.get("/api/orders/seller", opts)).data

export const updateOrderStatus = async (orderId, status) => (await axios.patch(`/api/orders/seller/${orderId}/status`, { status }, opts)).data

export const getSellerAnalytics = async () => (await axios.get("/api/orders/seller/analytics", opts)).data

export const getCoupons = async () => (await axios.get("/api/coupons", opts)).data

export const createCoupon = async coupon => (await axios.post("/api/coupons", coupon, opts)).data

export const toggleCoupon = async couponId => (await axios.patch(`/api/coupons/${couponId}/toggle`, {}, opts)).data

export const deleteCoupon = async couponId => (await axios.delete(`/api/coupons/${couponId}`, opts)).data
