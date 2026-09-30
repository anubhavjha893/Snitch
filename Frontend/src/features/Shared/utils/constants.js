// keep in sync with Backend/src/utils/pricing.js
export const FREE_SHIPPING_THRESHOLD = 1999;
export const SHIPPING_FEE = 99;

export const ORDER_STATUS_LABELS = {
    placed: 'Placed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    return_requested: 'Return requested',
    returned: 'Returned',
};

export const calculateTotals = (subtotal, discount = 0) => {
    const afterDiscount = Math.max(subtotal - discount, 0);
    const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    return { subtotal, discount, shipping, total: afterDiscount + shipping };
};

export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Chandigarh', 'Puducherry',
];
