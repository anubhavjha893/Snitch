import { createProduct, getSellerProduct, getAllProducts, getProductById, addProductVariant, updateProductVariantStock } from "../service/product.api"
import { useDispatch } from "react-redux"
import { setSellerProducts, setProducts } from "../state/product.slice"



export const useProduct = () => {

    const dispatch = useDispatch()

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData)
        return data.product
    }

    async function handleGetSellerProduct() {
        const data = await getSellerProduct()
        dispatch(setSellerProducts(data.products))
        return data.products
    }

    async function handleGetAllProducts() {

        const data = await getAllProducts()
        dispatch(setProducts(data.products))
    }

    async function handleGetProductById(productId) {
        const data = await getProductById(productId)
        return data.product
    }

    async function handleAddProductVariant(productId, newProductVariant) {
        const data = await addProductVariant(productId, newProductVariant)

        return data
    }

    async function handleUpdateProductVariantStock(productId, variantId, stock) {
        return updateProductVariantStock(productId, variantId, stock)
    }

    return { handleCreateProduct, handleGetSellerProduct, handleGetAllProducts, handleGetProductById ,handleAddProductVariant, handleUpdateProductVariantStock}

}