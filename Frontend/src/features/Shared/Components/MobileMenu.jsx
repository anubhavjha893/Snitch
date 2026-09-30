import { useEffect } from 'react'
import { Link, NavLink } from 'react-router'
import './MobileMenu.css'

const MenuLink = ({ to, index, label, count, end = false, onClick }) => (
    <NavLink to={to} end={end} className="mobile-menu__link" onClick={onClick}>
        <span className="mobile-menu__index">{String(index).padStart(2, '0')}</span>
        <span className="mobile-menu__label">{label}</span>
        {count > 0 && <span className="mobile-menu__count">{count}</span>}
        <span className="mobile-menu__arrow" aria-hidden="true">↗</span>
    </NavLink>
)

/**
 * Full-screen navigation for small screens.
 * Rendered outside the sticky header on purpose: the header uses backdrop-filter,
 * which would otherwise trap a fixed-position child inside the header's box.
 */
const MobileMenu = ({ open, onClose, user, cartCount, wishlistCount, onLogout }) => {
    useEffect(() => {
        if (!open) return
        const onKey = event => { if (event.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [ open, onClose ])

    if (!open) return null

    const isSeller = user?.role === 'seller'
    let index = 0
    const next = () => ++index

    return (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="mobile-menu__top">
                <Link to="/" className="snitch-nav__brand" onClick={onClose}>SNITCH.</Link>
                <button type="button" className="snitch-nav__burger mobile-menu__close" onClick={onClose} aria-label="Close menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6 6 18" />
                    </svg>
                </button>
            </div>

            <div className="mobile-menu__body">
                {user && (
                    <Link to="/account" className="mobile-menu__user" onClick={onClose}>
                        <span className="mobile-menu__avatar">{user.fullname?.trim()?.[ 0 ]?.toUpperCase() || '?'}</span>
                        <span className="mobile-menu__who">
                            <strong>{user.fullname}</strong>
                            <small>{user.email}</small>
                        </span>
                        <span className={`role-badge role-badge--${user.role}`}>{isSeller ? 'ADMIN' : 'USER'}</span>
                    </Link>
                )}

                <nav className="mobile-menu__nav" aria-label="Menu">
                    <MenuLink to="/" end index={next()} label="Shop" onClick={onClose} />
                    {user && <MenuLink to="/wishlist" index={next()} label="Wishlist" count={wishlistCount} onClick={onClose} />}
                    <MenuLink to="/cart" index={next()} label="Cart" count={cartCount} onClick={onClose} />
                    {user && <MenuLink to="/orders" index={next()} label="My orders" onClick={onClose} />}
                    {user && <MenuLink to="/account" index={next()} label="Account" onClick={onClose} />}
                </nav>

                {isSeller && (
                    <>
                        <p className="mobile-menu__section">SELLER TOOLS</p>
                        <nav className="mobile-menu__nav mobile-menu__nav--small" aria-label="Seller">
                            <MenuLink to="/seller/dashboard" index={next()} label="Products" onClick={onClose} />
                            <MenuLink to="/seller/orders" index={next()} label="Orders received" onClick={onClose} />
                            <MenuLink to="/seller/analytics" index={next()} label="Analytics" onClick={onClose} />
                            <MenuLink to="/seller/coupons" index={next()} label="Coupons" onClick={onClose} />
                        </nav>
                    </>
                )}
            </div>

            <div className="mobile-menu__footer">
                {user ? (
                    <button type="button" className="btn-ghost mobile-menu__cta" onClick={onLogout}>LOG OUT</button>
                ) : (
                    <div className="mobile-menu__auth">
                        <Link to="/login" className="btn-ghost mobile-menu__cta" onClick={onClose}>SIGN IN</Link>
                        <Link to="/register" className="btn-solid mobile-menu__cta" onClick={onClose}>SIGN UP</Link>
                    </div>
                )}
                <p>WEAR YOUR OWN RULES.</p>
            </div>
        </div>
    )
}

export default MobileMenu
