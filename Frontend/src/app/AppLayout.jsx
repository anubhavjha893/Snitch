import { useEffect } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { Outlet } from 'react-router'
import Nav from '../features/Shared/Components/Nav'
import Footer from '../features/Shared/Components/Footer'
import ScrollToTop from '../features/Shared/Components/ScrollToTop'
import { mergeGuestCart } from '../features/guest/mergeGuestCart'
import { getWishlist } from '../features/wishlist/service/wishlist.api'
import { setWishlist } from '../features/wishlist/state/wishlist.slice'

const AppLayout = () => {
    const dispatch = useDispatch()
    const store = useStore()
    const userId = useSelector(state => state.auth.user?.id)

    // keep the nav badges accurate right after login / page refresh
    // (this also covers Google sign-in, which reloads the app)
    useEffect(() => {
        if (!userId) return

        mergeGuestCart(store)
        getWishlist().then(data => dispatch(setWishlist(data.products))).catch(() => { })
    }, [ userId, dispatch, store ])

    return (
        <div className="app-shell">
            <ScrollToTop />
            <Nav />
            <div className="app-shell__content">
                <Outlet />
            </div>
            <Footer />
        </div>
    )
}

export default AppLayout
