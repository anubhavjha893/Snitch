import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        products: [],
        loaded: false
    },
    reducers: {
        setWishlist: (state, action) => {
            state.products = action.payload
            state.loaded = true
        },
        clearWishlist: state => {
            state.products = []
            state.loaded = false
        },
        removeWishlistProduct: (state, action) => {
            state.products = state.products.filter(product => product._id !== action.payload)
        },
        addWishlistProduct: (state, action) => {
            if (!state.products.some(product => product._id === action.payload._id)) {
                state.products.unshift(action.payload)
            }
        }
    }
})

export const { setWishlist, clearWishlist, removeWishlistProduct, addWishlistProduct } = wishlistSlice.actions
export default wishlistSlice.reducer
