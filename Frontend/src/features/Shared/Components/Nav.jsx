import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation, NavLink, Link } from 'react-router'
import { logout } from '../../auth/service/auth.api'
import { setUser } from '../../auth/state/auth.slice'
import { setCart } from '../../cart/state/cart.slice'
import { clearWishlist } from '../../wishlist/state/wishlist.slice'
import MobileMenu from './MobileMenu'

const Icon = ({ children }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
    </svg>
)

const Nav = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const [ menuOpen, setMenuOpen ] = useState(false)
    const user = useSelector(state => state.auth.user)
    const cartItems = useSelector(state => state.cart?.items)
    const wishlistCount = useSelector(state => state.wishlist.products.length)
    const guestItems = useSelector(state => state.guestCart.items)
    const cartCount = user
        ? cartItems?.reduce((count, item) => count + item.quantity, 0) || 0
        : guestItems.reduce((count, item) => count + item.quantity, 0)

    useEffect(() => { setMenuOpen(false) }, [ location.pathname ])

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [ menuOpen ])

    const handleLogout = async () => {
        try {
            await logout()
        } finally {
            dispatch(setUser(null))
            dispatch(setCart({ items: [], totalPrice: 0, currency: 'INR' }))
            dispatch(clearWishlist())
            navigate('/')
        }
    }

    const badge = count => count > 0 && <span className="snitch-nav__badge">{count > 9 ? '9+' : count}</span>

    return (
        <>
        <header className="snitch-nav">
            <div className="snitch-nav__bar">
                <Link to="/" className="snitch-nav__brand">SNITCH.</Link>

                <nav className="snitch-nav__links" aria-label="Main">
                    <NavLink to="/" end>Shop</NavLink>
                    {user && <NavLink to="/orders">Orders</NavLink>}
                    {user?.role === 'seller' && <NavLink to="/seller/dashboard">Seller</NavLink>}
                </nav>

                <div className="snitch-nav__actions">
                    {user ? (
                        <>
                            <Link to="/wishlist" className="snitch-nav__icon" aria-label="Wishlist" title="Wishlist">
                                <Icon><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></Icon>
                                {badge(wishlistCount)}
                            </Link>
                            <Link to="/cart" className="snitch-nav__icon" aria-label="Shopping cart" title="Shopping cart">
                                <Icon>
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </Icon>
                                {badge(cartCount)}
                            </Link>
                            <Link to="/account" className="snitch-nav__icon snitch-nav__account" aria-label="My account" title="My account">
                                <Icon><circle cx="12" cy="8" r="3.5" /><path d="M5 21a7 7 0 0 1 14 0" /></Icon>
                                <span className="snitch-nav__name">{user.fullname?.split(' ')[0]}{user.role === 'seller' && <em className="snitch-nav__role">ADMIN</em>}</span>
                            </Link>
                            <button type="button" onClick={handleLogout} className="snitch-nav__text snitch-nav__logout">Log out</button>
                        </>
                    ) : (
                        <>
                            <Link to="/cart" className="snitch-nav__icon" aria-label="Shopping cart" title="Shopping cart">
                                <Icon>
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </Icon>
                                {badge(cartCount)}
                            </Link>
                            <Link to="/login" className="snitch-nav__text">Sign In</Link>
                            <Link to="/register" className="snitch-nav__text snitch-nav__cta">Sign Up</Link>
                        </>
                    )}
                    <button
                        type="button"
                        className="snitch-nav__burger"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(open => !open)}
                    >
                        <Icon>{menuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</Icon>
                    </button>
                </div>
            </div>

        </header>

        <MobileMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            user={user}
            cartCount={cartCount}
            wishlistCount={wishlistCount}
            onLogout={() => { setMenuOpen(false); handleLogout() }}
        />
        </>
    )
}

export default Nav
