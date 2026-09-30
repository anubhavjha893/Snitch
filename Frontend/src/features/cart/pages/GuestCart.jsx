import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { changeGuestQuantity, removeGuestItem } from '../../guest/guestCart.slice';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';
import { calculateTotals } from '../../Shared/utils/constants';
import { formatPrice } from '../../Shared/utils/format';

const GuestCart = () => {
    usePageMeta({ title: 'Your cart' });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const items = useSelector(state => state.guestCart.items);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totals = calculateTotals(subtotal);

    if (!items.length) {
        return (
            <main className="page-shell page-shell--center">
                <p className="page-shell__eyebrow">YOUR CART</p>
                <h1 className="page-shell__title">Your selection is empty.</h1>
                <Link to="/" className="btn-solid">EXPLORE THE DROP</Link>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <p className="page-shell__eyebrow">{items.length} {items.length === 1 ? 'PIECE' : 'PIECES'}</p>
            <h1 className="page-shell__title">Your cart</h1>

            <div className="checkout">
                <div className="checkout__main">
                    <ul className="guest-lines">
                        {items.map(item => (
                            <li key={`${item.productId}-${item.variantId}`}>
                                <Link to={`/product/${item.productId}`} className="checkout__thumb guest-lines__thumb">
                                    {item.image && <img src={item.image} alt={item.title} />}
                                </Link>
                                <div className="guest-lines__info">
                                    <Link to={`/product/${item.productId}`}>{item.title}</Link>
                                    <small>{Object.values(item.attributes || {}).join(' / ')}</small>
                                    <strong>{formatPrice(item.price)}</strong>
                                    <div className="guest-lines__controls">
                                        <div className="qty">
                                            <button type="button" aria-label="Decrease quantity" onClick={() => dispatch(changeGuestQuantity({ productId: item.productId, variantId: item.variantId, delta: -1 }))}>−</button>
                                            <span>{item.quantity}</span>
                                            <button type="button" aria-label="Increase quantity" disabled={item.quantity >= item.stock} onClick={() => dispatch(changeGuestQuantity({ productId: item.productId, variantId: item.variantId, delta: 1 }))}>+</button>
                                        </div>
                                        <button type="button" className="link-btn" onClick={() => dispatch(removeGuestItem({ productId: item.productId, variantId: item.variantId }))}>REMOVE</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <aside className="checkout__summary" aria-label="Order summary">
                    <h2>The total</h2>
                    <dl className="checkout__totals">
                        <div><dt>Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
                        <div><dt>Shipping</dt><dd>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</dd></div>
                        <div className="checkout__grand"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
                    </dl>
                    <button type="button" className="btn-solid checkout__pay" onClick={() => navigate('/login', { state: { redirectTo: '/checkout' } })}>
                        SIGN IN TO CHECKOUT
                    </button>
                    <p className="checkout__note">Your cart is saved on this device and moves to your account when you sign in.</p>
                    <Link to="/" className="checkout__back">← Continue shopping</Link>
                </aside>
            </div>
        </main>
    );
};

export default GuestCart;
