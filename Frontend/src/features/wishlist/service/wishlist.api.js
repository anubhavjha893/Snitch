import axios from "axios"

const wishlistApiInstance = axios.create({
    baseURL: "/api/wishlist",
    withCredentials: true
})

export const getWishlist = async () => (await wishlistApiInstance.get("/")).data

export const addToWishlist = async productId => (await wishlistApiInstance.post(`/${productId}`)).data

export const removeFromWishlist = async productId => (await wishlistApiInstance.delete(`/${productId}`)).data
