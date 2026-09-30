import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation } from "react-router"
import { addToWishlist, getWishlist, removeFromWishlist } from "../service/wishlist.api"
import { useToast } from "../../Shared/hooks/useToast"
import { addWishlistProduct, removeWishlistProduct, setWishlist } from "../state/wishlist.slice"

export const useWishlist = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { toast } = useToast()
    const user = useSelector(state => state.auth.user)
    const products = useSelector(state => state.wishlist.products)

    const loadWishlist = useCallback(async () => {
        const data = await getWishlist()
        dispatch(setWishlist(data.products))
        return data.products
    }, [ dispatch ])

    const isWishlisted = useCallback(productId => products.some(product => product._id === productId), [ products ])

    const toggleWishlist = useCallback(async product => {
        if (!user) {
            navigate('/login', { state: { redirectTo: location.pathname } })
            return
        }

        if (isWishlisted(product._id)) {
            dispatch(removeWishlistProduct(product._id))
            toast("Removed from wishlist")
            try {
                await removeFromWishlist(product._id)
            } catch {
                dispatch(addWishlistProduct(product))
                toast("Could not update your wishlist", "error")
            }
        } else {
            dispatch(addWishlistProduct(product))
            toast("Saved to your wishlist", "success")
            try {
                await addToWishlist(product._id)
            } catch {
                dispatch(removeWishlistProduct(product._id))
                toast("Could not update your wishlist", "error")
            }
        }
    }, [ user, isWishlisted, dispatch, navigate, location.pathname, toast ])

    return { products, loadWishlist, isWishlisted, toggleWishlist }
}
