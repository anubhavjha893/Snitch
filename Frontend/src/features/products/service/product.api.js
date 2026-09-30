import axios from "axios";

const productApiInstance = axios.create({
    baseURL: "/api/products",
    withCredentials: true,
})

export async function createProduct(formData) {
    const response = await productApiInstance.post("/", formData)

    return response.data
}

export async function getSellerProduct() {
    const response = await productApiInstance.get("/seller")
    return response.data
}

export async function getAllProducts() {
    const response = await productApiInstance.get("/")
    return response.data
}

export async function getProductById(productId) {
    const response = await productApiInstance.get(`/detail/${productId}`)
    return response.data
}

export async function addProductVariant(productId, newProductVariant) {

    console.log(newProductVariant)

    const formData = new FormData()

    newProductVariant.images.forEach((image) => {
        formData.append(`images`, image.file)
    })

    formData.append("stock", newProductVariant.stock)
    formData.append("priceAmount", newProductVariant.price)
    formData.append("attributes", JSON.stringify(newProductVariant.attributes))

    const response = await productApiInstance.post(`/${productId}/variants`, formData)

    return response.data

}

export async function updateProductVariantStock(productId, variantId, stock) {
    const response = await productApiInstance.patch(`/${productId}/variants/${variantId}/stock`, { stock })
    return response.data
}

export async function getReviews(productId) {
    const response = await productApiInstance.get(`/${productId}/reviews`)
    return response.data
}

export async function saveReview(productId, { rating, comment }) {
    const response = await productApiInstance.post(`/${productId}/reviews`, { rating, comment })
    return response.data
}

export async function deleteReview(productId) {
    const response = await productApiInstance.delete(`/${productId}/reviews`)
    return response.data
}

export async function updateProduct(productId, updates) {
    const response = await productApiInstance.patch(`/${productId}`, updates)
    return response.data
}

export async function deleteProduct(productId) {
    const response = await productApiInstance.delete(`/${productId}`)
    return response.data
}
