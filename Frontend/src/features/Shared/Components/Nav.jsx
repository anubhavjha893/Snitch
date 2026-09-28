import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router'
import { logout } from '../../auth/service/auth.api'
import { setUser } from '../../auth/state/auth.slice'
import { setCart } from '../../cart/state/cart.slice'

const Nav = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const user = useSelector(state => state.auth.user)
    const cartItems = useSelector(state => state.cart?.items)
    const cartCount = cartItems?.reduce((count, item) => count + item.quantity, 0) || 0

    const handleLogout = async () => {
        try {
            await logout()
        } finally {
            dispatch(setUser(null))
            dispatch(setCart({ items: [], totalPrice: 0, currency: 'INR' }))
            navigate('/')
        }
    }

    return (
        <nav className="snitch-nav px-5 sm:px-8 lg:px-16 xl:px-24 py-4 flex items-center justify-between border-b" style={{ borderColor: '#e4e2df' }}>
            <Link to="/"
                className="text-xl font-extrabold tracking-[0.08em] uppercase hover:opacity-80 transition-opacity"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", color: '#171717' }}
            >
                SNITCH.
            </Link>
            <div className="flex gap-3 sm:gap-5 items-center text-[10px] uppercase tracking-[0.12em] font-bold" style={{ color: '#66665f' }}>
                {user ? (
                    <>
                        <Link to="/account" className="flex items-center gap-2 hover:opacity-70" style={{ color: '#171717' }} aria-label="My account" title="My account">
                            <svg className="h-4 w-4 sm:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="12" cy="8" r="3.5" />
                                <path d="M5 21a7 7 0 0 1 14 0" />
                            </svg>
                            <span className="hidden sm:inline">{user.fullname}</span>
                        </Link>
                        {user.role === 'seller' && (
                            <Link to="/seller/dashboard" className="hidden md:inline transition-colors hover:text-[#C9A96E]">Seller Dashboard</Link>
                        )}
                        <Link
                            to="/cart"
                            className="relative flex items-center hover:opacity-70 transition-opacity"
                            style={{ color: '#171717' }}
                            aria-label="Shopping cart"
                            title="Shopping cart"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                            {cartCount > 0 && (
                                <span
                                    className="absolute -top-2 -right-2 flex items-center justify-center rounded-full text-white"
                                    style={{
                                        backgroundColor: '#C9A96E',
                                        width: '16px',
                                        height: '16px',
                                        fontSize: '9px',
                                        fontFamily: "'Inter', sans-serif",
                                        fontWeight: 600,
                                        letterSpacing: 0,
                                    }}
                                >
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>
                        <button type="button" onClick={handleLogout} className="transition-opacity hover:opacity-60">Log out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="transition-colors hover:text-[#C9A96E]">Sign In</Link>
                        <Link to="/register" className="transition-colors hover:text-[#C9A96E]">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Nav