import { useEffect, useEffectEvent, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useCart } from '../hook/useCart';

const formatPrice = (price = {}) => `${price.currency || 'INR'} ${Number(price.amount || 0).toLocaleString('en-IN')}`;

const OrderReceipt = () => {
    const location = useLocation();
    const orderId = new URLSearchParams(location.search).get('order_id');
    const { handleGetOrderDetails } = useCart();
    const [ order, setOrder ] = useState(null);
    const [ error, setError ] = useState('');
    const [ loading, setLoading ] = useState(true);

    const loadOrder = useEffectEvent(async () => {
        try {
            const details = await handleGetOrderDetails(orderId);
            setOrder(details);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'We could not load this order.');
        } finally {
            setLoading(false);
        }
    });

    useEffect(() => {
        if (orderId) loadOrder();
        else setLoading(false);
    }, [ orderId ]);

    if (loading) {
        return <main className="order-receipt"><p>LOADING YOUR ORDER...</p></main>;
    }

    if (error || !order) {
        return (
            <main className="order-receipt">
                <p className="order-receipt__eyebrow">ORDER STATUS</p>
                <h1>{error || 'No order reference found.'}</h1>
                <Link className="order-receipt__button" to="/">BACK TO SHOP</Link>
            </main>
        );
    }

    return (
        <main className="order-receipt">
            <p className="order-receipt__eyebrow">{order.status === 'paid' ? 'PAYMENT CONFIRMED' : 'PAYMENT NOT COMPLETE'}</p>
            <h1>{order.status === 'paid' ? 'You’re all set.' : 'Your order is not confirmed.'}</h1>
            <p className="order-receipt__reference">ORDER / {order.orderId}</p>

            <section className="order-receipt__items" aria-label="Order items">
                {order.items.map(item => (
                    <article className="order-receipt__item" key={`${item.productId}-${item.variantId}`}>
                        <div className="order-receipt__image">
                            {item.images?.[0]?.url && <img src={item.images[0].url} alt={item.title} />}
                        </div>
                        <div className="order-receipt__item-info">
                            <h2>{item.title}</h2>
                            <p>{Object.values(item.attributes || {}).join(' / ') || 'SNITCH'} · QTY {item.quantity}</p>
                        </div>
                        <strong>{formatPrice({ amount: item.price?.amount * item.quantity, currency: item.price?.currency })}</strong>
                    </article>
                ))}
                <div className="order-receipt__total">
                    <span>TOTAL PAID</span>
                    <strong>{formatPrice(order.total)}</strong>
                </div>
            </section>

            <div className="order-receipt__actions">
                <Link className="order-receipt__button" to="/">KEEP SHOPPING</Link>
                <Link className="order-receipt__secondary" to="/account">ACCOUNT DETAILS</Link>
            </div>
        </main>
    );
};

export default OrderReceipt;