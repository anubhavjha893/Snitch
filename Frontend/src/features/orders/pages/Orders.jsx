import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getMyOrders } from '../../cart/service/cart.api';
import { formatDate, formatPrice } from '../../Shared/utils/format';
import { ORDER_STATUS_LABELS } from '../../Shared/utils/constants';
import { SkeletonRows } from '../../Shared/Components/Skeleton';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';

const Orders = () => {
    usePageMeta({ title: 'My orders' });
    const [ orders, setOrders ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState('');

    useEffect(() => {
        getMyOrders()
            .then(data => setOrders(data.orders))
            .catch(() => setError('We could not load your orders. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <main className="page-shell">
            <p className="page-shell__eyebrow">ORDER HISTORY</p>
            <h1 className="page-shell__title">My orders</h1>

            {loading ? (
                <SkeletonRows />
            ) : error ? (
                <p className="page-shell__note">{error}</p>
            ) : orders.length ? (
                <div className="order-list">
                    {orders.map(order => (
                        <Link key={order.orderId} to={`/order-success?order_id=${order.orderId}`} className="order-card">
                            <div className="order-card__head">
                                <span>{formatDate(order.createdAt)}</span>
                                <span className="order-card__id">#{order.orderId.slice(-8).toUpperCase()}</span>
                                <span className={`status-badge status-badge--${order.orderStatus}`}>{ORDER_STATUS_LABELS[ order.orderStatus ]}</span>
                                <strong>{formatPrice(order.total?.amount, order.total?.currency)}</strong>
                            </div>
                            <div className="order-card__thumbs">
                                {order.items.slice(0, 4).map(item => (
                                    <div key={`${item.productId}-${item.variantId}`} className="order-card__thumb">
                                        {item.images?.[0]?.url && <img src={item.images[0].url} alt={item.title} loading="lazy" />}
                                    </div>
                                ))}
                                {order.items.length > 4 && <span className="order-card__more">+{order.items.length - 4}</span>}
                            </div>
                            <p className="order-card__names">{order.items.map(item => `${item.title} × ${item.quantity}`).join(', ')}</p>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="page-shell__empty">
                    <h2>No orders yet.</h2>
                    <p>Your first SNITCH order will show up here.</p>
                    <Link to="/" className="btn-solid">START SHOPPING</Link>
                </div>
            )}
        </main>
    );
};

export default Orders;
