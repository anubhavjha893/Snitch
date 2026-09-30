import axios from "axios"

const addressApiInstance = axios.create({
    baseURL: "/api/addresses",
    withCredentials: true
})

export const getAddresses = async () => (await addressApiInstance.get("/")).data

export const addAddress = async address => (await addressApiInstance.post("/", address)).data

export const updateAddress = async (addressId, address) => (await addressApiInstance.patch(`/${addressId}`, address)).data

export const deleteAddress = async addressId => (await addressApiInstance.delete(`/${addressId}`)).data
