export const ORDER_STATUSES = [ "placed", "shipped", "delivered", "cancelled", "return_requested", "returned" ]

export const RETURN_WINDOW_DAYS = 14

// what a seller is allowed to move an order to, from its current status
const SELLER_TRANSITIONS = {
    placed: [ "shipped" ],
    shipped: [ "delivered" ],
    return_requested: [ "returned", "delivered" ]
}

export const canSellerTransition = (from, to) => (SELLER_TRANSITIONS[ from ] || []).includes(to)

export const canBuyerCancel = status => status === "placed"

export const canRequestReturn = (status, deliveredAt, now = new Date()) => {
    if (status !== "delivered" || !deliveredAt) return false
    const elapsedDays = (now - new Date(deliveredAt)) / (1000 * 60 * 60 * 24)
    return elapsedDays <= RETURN_WINDOW_DAYS
}
