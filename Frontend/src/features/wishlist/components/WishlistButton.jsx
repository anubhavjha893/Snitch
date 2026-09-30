import { useWishlist } from '../hook/useWishlist';

const WishlistButton = ({ product, className = '' }) => {
    const { isWishlisted, toggleWishlist } = useWishlist();
    const active = isWishlisted(product._id);

    return (
        <button
            type="button"
            className={`wishlist-btn ${active ? 'is-active' : ''} ${className}`}
            aria-pressed={active}
            aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
            title={active ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                toggleWishlist(product);
            }}
        >
            <svg viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        </button>
    );
};

export default WishlistButton;
