import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "snitch-guest-cart";

const load = () => {
    try {
        const items = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(items) ? items : [];
    } catch {
        return [];
    }
};

const persist = items => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* storage unavailable */ }
};

const sameLine = (item, payload) => item.productId === payload.productId && item.variantId === payload.variantId;

// A guest cart line is a self-contained snapshot, so it can be shown without hitting the API:
// { productId, variantId, quantity, stock, title, image, price, currency, attributes }
const guestCartSlice = createSlice({
    name: "guestCart",
    initialState: { items: load() },
    reducers: {
        addGuestItem: (state, action) => {
            const existing = state.items.find(item => sameLine(item, action.payload));

            if (existing) {
                existing.quantity = Math.min(existing.quantity + 1, action.payload.stock ?? Infinity);
                existing.stock = action.payload.stock;
            } else {
                state.items.push({ ...action.payload, quantity: 1 });
            }
            persist(state.items);
        },
        changeGuestQuantity: (state, action) => {
            const { productId, variantId, delta } = action.payload;
            const item = state.items.find(line => sameLine(line, { productId, variantId }));

            if (!item) return;

            item.quantity = Math.min(item.quantity + delta, item.stock ?? Infinity);
            if (item.quantity <= 0) state.items = state.items.filter(line => line !== item);
            persist(state.items);
        },
        removeGuestItem: (state, action) => {
            state.items = state.items.filter(item => !sameLine(item, action.payload));
            persist(state.items);
        },
        clearGuestCart: state => {
            state.items = [];
            persist(state.items);
        }
    }
});

export const { addGuestItem, changeGuestQuantity, removeGuestItem, clearGuestCart } = guestCartSlice.actions;
export default guestCartSlice.reducer;
