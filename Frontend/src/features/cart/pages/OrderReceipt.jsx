import { useEffect, useEffectEvent, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useCart } from '../hook/useCart';
import { cancelOrderApi, requestReturnApi } from '../service/cart.api';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';
import { useToast } from '../../Shared/hooks/useToast';
import { ORDER_STATUS_LABELS } from '../../Shared/utils/constants';
import { formatDate, formatPrice } from '../../Shared/utils/format';

const OrderReceipt = () => {
    usePageMeta({ title: 'Order details' });

    const location = useLocation();
    const orderId = new URLSearchParams(location.search).get('order_id');
    const { handleGetOrderDetails } = useCart();
    const { toast } = useToast();
    const [ order, setOrder ] = useState(null);
    const [ error, setError ] = useState('');
    const [ loading, setLoading ] = useState(true);
    const [ dialog, setDialog ] = useState(null); // 'cancel' | 'return'
    const [ reason, setReason ] = useState('');
    const [ busy, setBusy ] = useState(false);

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

    const submitDialog = async event => {
        event.preventDefault();
        setBusy(true);

        try {
            const data = dialog === 'cancel'
                ? await cancelOrderApi(orderId, reason)
                : await requestReturnApi(orderId, reason);
            setOrder(await handleGetOrderDetails(orderId));
            toast(data.message, 'success');
            setDialog(null);
            setReason('');
        } catch (requestError) {
            toast(requestError.response?.data?.message || 'Something went wrong. Please try again.', 'error');
        } finally {
            setBusy(false);
        }
    };

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

    const paid = order.status === 'paid';
    const address = order.shippingAddress;

    return (
        <main className="order-receipt">
            <p className="order-receipt__eyebrow">{paid ? 'PAYMENT CONFIRMED' : 'PAYMENT NOT COMPLETE'}</p>
            <h1>{paid ? 'You’re all set.' : 'Your order is not confirmed.'}</h1>
            <p className="order-receipt__reference">
                ORDER / {order.orderId}
                {paid && <span className={`status-badge status-badge--${order.orderStatus}`}>{ORDER_STATUS_LABELS[ order.orderStatus ]}</span>}
            </p>

            {paid && order.statusHistory?.length > 0 && (
                <ol className="timeline" aria-label="Order progress">
                    {order.statusHistory.map((entry, index) => (
                        <li key={`${entry.status}-${index}`}>
                            <strong>{ORDER_STATUS_LABELS[ entry.status ] || entry.status}</strong>
                            <span>{formatDate(entry.at)}</span>
                            {entry.note && <small>{entry.note}</small>}
                        </li>
                    ))}
                </ol>
            )}

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
                        <strong>{formatPrice(item.price?.amount * item.quantity, item.price?.currency)}</strong>
                    </article>
                ))}

                {order.subtotal != null && (
                    <div className="order-receipt__lines">
                        <div><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                        {order.discount > 0 && <div><span>Discount {order.coupon?.code && `(${order.coupon.code})`}</span><span>− {formatPrice(order.discount)}</span></div>}
                        <div><span>Shipping</span><span>{order.shipping ? formatPrice(order.shipping) : 'Free'}</span></div>
                    </div>
                )}

                <div className="order-receipt__total">
                    <span>TOTAL PAID</span>
                    <strong>{formatPrice(order.total?.amount, order.total?.currency)}</strong>
                </div>
            </section>

            {address?.line1 && (
                <section className="order-receipt__address">
                    <h3>DELIVERING TO</h3>
                    <p>{address.name}</p>
                    <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                    <p>{address.city}, {address.state} {address.pincode}</p>
                    <p>Phone: {address.phone}</p>
                </section>
            )}

            {order.refund?.status && (
                <p className="order-receipt__refund">
                    Refund of {formatPrice(order.refund.amount)}: {order.refund.status === 'failed' ? 'could not be processed automatically — our team will settle it shortly.' : `${order.refund.status}. It reaches your account in 5–7 working days.`}
                </p>
            )}

            <div className="order-receipt__actions">
                <Link className="order-receipt__button" to="/">KEEP SHOPPING</Link>
                <Link className="order-receipt__secondary" to="/orders">ALL ORDERS</Link>
                {order.canCancel && <button type="button" className="order-receipt__secondary" onClick={() => setDialog('cancel')}>CANCEL ORDER</button>}
                {order.canReturn && <button type="button" className="order-receipt__secondary" onClick={() => setDialog('return')}>REQUEST RETURN</button>}
            </div>

            {dialog && (
                <div className="seller-modal" role="dialog" aria-modal="true" aria-label={dialog === 'cancel' ? 'Cancel order' : 'Request return'}>
                    <form onSubmit={submitDialog}>
                        <h2>{dialog === 'cancel' ? 'Cancel this order?' : 'Request a return'}</h2>
                        <label>
                            {dialog === 'cancel' ? 'Reason (optional)' : 'Why are you returning it?'}
                            <textarea rows={3} value={reason} onChange={event => setReason(event.target.value)} required={dialog === 'return'} maxLength={300} />
                        </label>
                        <div className="seller-actions">
                            <button type="submit" className="is-danger" disabled={busy}>{busy ? 'Please wait...' : dialog === 'cancel' ? 'Yes, cancel order' : 'Submit request'}</button>
                            <button type="button" onClick={() => setDialog(null)}>Back</button>
                        </div>
                    </form>
                </div>
            )}
        </main>
    );
};

export default OrderReceipt;
