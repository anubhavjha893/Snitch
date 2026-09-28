import { useCallback } from "react"
import { addItem, getCart, incrementCartItemApi, decrementCartItemApi, removeCartItemApi, createCartOrder, verifyCartOrder, getOrderDetails } from "../service/cart.api"
import { useDispatch } from "react-redux"
import { setCart } from "../state/cart.slice"


export const useCart = () => {

    const dispatch = useDispatch()

    const handleGetCart = useCallback(async () => {
        const data = await getCart()
        dispatch(setCart(data.cart))
        return data.cart
    }, [ dispatch ])

    const handleAddItem = useCallback(async ({ productId, variantId }) => {
        const data = await addItem({ productId, variantId })
        await handleGetCart()
        return data
    }, [ handleGetCart ])

    const handleIncrementCartItem = useCallback(async ({ productId, variantId }) => {
        await incrementCartItemApi({ productId, variantId })
        return handleGetCart()
    }, [ handleGetCart ])

    const handleDecrementCartItem = useCallback(async ({ productId, variantId }) => {
        await decrementCartItemApi({ productId, variantId })
        return handleGetCart()
    }, [ handleGetCart ])

    const handleRemoveCartItem = useCallback(async ({ productId, variantId }) => {
        await removeCartItemApi({ productId, variantId })
        return handleGetCart()
    }, [ handleGetCart ])

    const handleCreateCartOrder = useCallback(async () => {
        const data = await createCartOrder()
        return data
    }, [])

    const handleVerifyCartOrder = useCallback(async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
        const data = await verifyCartOrder({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
        return data.success
    }, [])

    const handleGetOrderDetails = useCallback(async orderId => {
        const data = await getOrderDetails(orderId)
        return data.order
    }, [])

    return { handleAddItem, handleGetCart, handleIncrementCartItem, handleDecrementCartItem, handleRemoveCartItem, handleCreateCartOrder, handleVerifyCartOrder, handleGetOrderDetails }

}