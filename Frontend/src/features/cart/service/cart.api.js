import axios from "axios"


const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true
})


export const addItem = async ({ productId, variantId }) => {
    const response = await cartApiInstance.post(`/add/${productId}/${variantId}`, {
        quantity: 1
    })

    return response.data
}

export const getCart = async () => {
    const response = await cartApiInstance.get("/")
    return response.data
}

export const incrementCartItemApi = async ({ productId, variantId }) => {
    const response = await cartApiInstance.patch(`/quantity/increment/${productId}/${variantId}`)
    return response.data
}

export const decrementCartItemApi = async ({ productId, variantId }) => {
    const response = await cartApiInstance.patch(`/quantity/decrement/${productId}/${variantId}`)
    return response.data
}

export const removeCartItemApi = async ({ productId, variantId }) => {
    const response = await cartApiInstance.delete(`/remove/${productId}/${variantId}`)
    return response.data
}

export const createCartOrder = async ({ addressId, couponCode } = {}) => {
    const response = await cartApiInstance.post("/payment/create/order", { addressId, couponCode })
    return response.data
}

export const verifyCartOrder = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
    const response = await cartApiInstance.post("/payment/verify/order", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    })

    return response.data
}

export const getOrderDetails = async (orderId) => {
    const response = await cartApiInstance.get(`/payment/order/${orderId}`)
    return response.data
}

export const getMyOrders = async () => {
    const response = await cartApiInstance.get("/orders")
    return response.data
}


export const validateCoupon = async code => {
    const response = await axios.post("/api/coupons/validate", { code }, { withCredentials: true })
    return response.data
}

export const cancelOrderApi = async (orderId, reason) => {
    const response = await axios.post(`/api/orders/${orderId}/cancel`, { reason }, { withCredentials: true })
    return response.data
}

export const requestReturnApi = async (orderId, reason) => {
    const response = await axios.post(`/api/orders/${orderId}/return`, { reason }, { withCredentials: true })
    return response.data
}
