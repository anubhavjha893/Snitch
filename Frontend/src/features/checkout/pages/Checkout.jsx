import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router';
import { useRazorpay } from 'react-razorpay';
import { useCart } from '../../cart/hook/useCart';
import { validateCoupon } from '../../cart/service/cart.api';
import AddressBook from '../../addresses/components/AddressBook';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';
import { useToast } from '../../Shared/hooks/useToast';
import { calculateTotals, FREE_SHIPPING_THRESHOLD } from '../../Shared/utils/constants';
import { formatPrice } from '../../Shared/utils/format';

const Checkout = () => {
    usePageMeta({ title: 'Checkout' });

    const navigate = useNavigate();
    const { toast } = useToast();
    const { isLoading: razorpayLoading, Razorpay } = useRazorpay();
    const { handleGetCart, handleCreateCartOrder, handleVerifyCartOrder } = useCart();
    const cart = useSelector(state => state.cart);
    const user = useSelector(state => state.auth.user);

    const [ cartLoading, setCartLoading ] = useState(true);
    const [ addressId, setAddressId ] = useState(null);
    const [ couponInput, setCouponInput ] = useState('');
    const [ coupon, setCoupon ] = useState(null); // { code, discount }
    const [ couponError, setCouponError ] = useState('');
    const [ paying, setPaying ] = useState(false);
    const [ error, setError ] = useState('');

    useEffect(() => {
        handleGetCart().finally(() => setCartLoading(false));
    }, [ handleGetCart ]);

    const subtotal = cart.totalPrice || 0;
    const totals = calculateTotals(subtotal, coupon?.discount || 0);

    const applyCoupon = async event => {
        event.preventDefault();
        setCouponError('');

        try {
            const data = await validateCoupon(couponInput);
            setCoupon({ code: data.coupon.code, discount: data.totals.discount });
            toast(`Coupon ${data.coupon.code} applied`, 'success');
        } catch (requestError) {
            setCoupon(null);
            setCouponError(requestError.response?.data?.message || 'Could not apply this coupon.');
        }
    };

    const removeCoupon = () => {
        setCoupon(null);
        setCouponInput('');
    };

    const pay = async () => {
        setError('');

        if (!addressId) {
            setError('Please choose or add a delivery address.');
            return;
        }

        setPaying(true);

        try {
            const { order, keyId } = await handleCreateCartOrder({ addressId, couponCode: coupon?.code });

            const razorpayInstance = new Razorpay({
                key: keyId,
                amount: order.amount,
                currency: order.currency,
                name: 'SNITCH',
                description: 'Your SNITCH order',
                order_id: order.id,
                handler: async response => {
                    try {
                        const isValid = await handleVerifyCartOrder(response);
                        if (isValid) {
                            await handleGetCart();
                            navigate(`/order-success?order_id=${response.razorpay_order_id}`);
                        }
                    } catch {
                        setError('We could not confirm your payment. If money was deducted, it will be refunded automatically.');
                        setPaying(false);
                    }
                },
                modal: { ondismiss: () => setPaying(false) },
                prefill: { name: user?.fullname, email: user?.email, contact: user?.contact },
                theme: { color: '#171717' },
            });

            razorpayInstance.on('payment.failed', response => {
                setError(response.error?.description || 'Payment could not be completed. Please try again.');
                setPaying(false);
            });

            razorpayInstance.open();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to start checkout. Please try again.');
            setPaying(false);
        }
    };

    if (cartLoading) {
        return <main className="page-shell"><p className="page-shell__note">LOADING CHECKOUT...</p></main>;
    }

    if (!cart.items?.length) {
        return (
            <main className="page-shell page-shell--center">
                <p className="page-shell__eyebrow">CHECKOUT</p>
                <h1 className="page-shell__title">Your cart is empty.</h1>
                <Link to="/" className="btn-solid">EXPLORE THE DROP</Link>
            </main>
        );
    }

    return (
        <main className="page-shell">
            <p className="page-shell__eyebrow">SECURE CHECKOUT</p>
            <h1 className="page-shell__title">Checkout</h1>

            <div className="checkout">
                <div className="checkout__main">
                    <section className="checkout__section">
                        <h2>1. Delivery address</h2>
                        <AddressBook
                            selectable
                            selectedId={addressId}
                            onSelect={setAddressId}
                            onLoaded={list => setAddressId(current => current || list.find(item => item.isDefault)?._id || list[ 0 ]?._id || null)}
                        />
                    </section>

                    <section className="checkout__section">
                        <h2>2. Coupon</h2>
                        {coupon ? (
                            <p className="coupon-applied">
                                <strong>{coupon.code}</strong> applied — you save {formatPrice(coupon.discount)}
                                <button type="button" onClick={removeCoupon}>REMOVE</button>
                            </p>
                        ) : (
                            <form className="coupon-form" onSubmit={applyCoupon}>
                                <input
                                    value={couponInput}
                                    onChange={event => setCouponInput(event.target.value.toUpperCase())}
                                    placeholder="Enter coupon code"
                                    aria-label="Coupon code"
                                    maxLength={20}
                                />
                                <button type="submit" className="btn-ghost" disabled={!couponInput.trim()}>APPLY</button>
                            </form>
                        )}
                        {couponError && <p className="account-form__error" role="alert">{couponError}</p>}
                    </section>
                </div>

                <aside className="checkout__summary" aria-label="Order summary">
                    <h2>Order summary</h2>

                    <ul className="checkout__items">
                        {cart.items.map(item => {
                            const variant = Array.isArray(item.product.variants) ? item.product.variants.find(entry => entry._id === item.variant) : item.product.variants;
                            const image = variant?.images?.[ 0 ]?.url || item.product.images?.[ 0 ]?.url;
                            return (
                                <li key={`${item.product._id}-${item.variant}`}>
                                    <div className="checkout__thumb">{image && <img src={image} alt={item.product.title} />}</div>
                                    <div>
                                        <p>{item.product.title}</p>
                                        <small>{Object.values(variant?.attributes || {}).join(' / ')} · QTY {item.quantity}</small>
                                    </div>
                                    <span>{formatPrice((variant?.price?.amount ?? item.product.price?.amount) * item.quantity)}</span>
                                </li>
                            );
                        })}
                    </ul>

                    <dl className="checkout__totals">
                        <div><dt>Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
                        {totals.discount > 0 && <div><dt>Discount ({coupon.code})</dt><dd>− {formatPrice(totals.discount)}</dd></div>}
                        <div><dt>Shipping</dt><dd>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</dd></div>
                        {totals.shipping > 0 && <small>Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</small>}
                        <div className="checkout__grand"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
                    </dl>

                    {error && <p className="account-form__error" role="alert">{error}</p>}

                    <button type="button" className="btn-solid checkout__pay" onClick={pay} disabled={paying || razorpayLoading || !Razorpay}>
                        {paying ? 'PROCESSING...' : `PAY ${formatPrice(totals.total)}`}
                    </button>
                    <Link to="/cart" className="checkout__back">← Back to cart</Link>
                </aside>
            </div>
        </main>
    );
};

export default Checkout;
