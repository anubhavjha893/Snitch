import { useEffect, useState } from 'react';
import { getSellerOrders, updateOrderStatus } from '../service/seller.api';
import SellerTabs from '../components/SellerTabs';
import { SkeletonRows } from '../../Shared/Components/Skeleton';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';
import { useToast } from '../../Shared/hooks/useToast';
import { ORDER_STATUS_LABELS } from '../../Shared/utils/constants';
import { formatDate, formatPrice } from '../../Shared/utils/format';

const ACTION_LABELS = {
    shipped: 'Mark as shipped',
    delivered: 'Mark as delivered',
    returned: 'Approve return & refund',
};

const SellerOrders = () => {
    usePageMeta({ title: 'Seller orders' });
    const { toast } = useToast();
    const [ orders, setOrders ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ filter, setFilter ] = useState('all');
    const [ busyId, setBusyId ] = useState(null);

    const load = () => getSellerOrders().then(data => setOrders(data.orders));

    useEffect(() => {
        load().catch(() => toast('Could not load orders', 'error')).finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const change = async (orderId, status) => {
        setBusyId(orderId);
        try {
            const data = await updateOrderStatus(orderId, status);
            toast(data.message, 'success');
            await load();
        } catch (error) {
            toast(error.response?.data?.message || 'Could not update the order', 'error');
        } finally {
            setBusyId(null);
        }
    };

    const visible = orders.filter(order => filter === 'all' || order.orderStatus === filter);

    return (
        <main className="page-shell">
            <p className="page-shell__eyebrow">SELLER</p>
            <h1 className="page-shell__title">Orders received</h1>
            <SellerTabs />

            <div className="chip-row" role="group" aria-label="Filter orders">
                {[ 'all', ...Object.keys(ORDER_STATUS_LABELS) ].map(status => (
                    <button key={status} type="button" className={filter === status ? 'is-active' : ''} onClick={() => setFilter(status)}>
                        {status === 'all' ? 'All' : ORDER_STATUS_LABELS[ status ]}
                    </button>
                ))}
            </div>

            {loading ? <SkeletonRows /> : visible.length === 0 ? (
                <p className="page-shell__note">No orders here yet.</p>
            ) : (
                <div className="order-list">
                    {visible.map(order => (
                        <article key={order.orderId} className="order-card order-card--static">
                            <div className="order-card__head">
                                <span>{formatDate(order.createdAt)}</span>
                                <span className="order-card__id">#{order.orderId.slice(-8).toUpperCase()}</span>
                                <span className={`status-badge status-badge--${order.orderStatus}`}>{ORDER_STATUS_LABELS[ order.orderStatus ]}</span>
                                <strong>{formatPrice(order.items.reduce((sum, item) => sum + item.price.amount * item.quantity, 0))}</strong>
                            </div>

                            <ul className="seller-order-items">
                                {order.items.map(item => (
                                    <li key={`${item.productId}-${item.variantId}`}>
                                        <div className="order-card__thumb">{item.images?.[ 0 ]?.url && <img src={item.images[ 0 ].url} alt={item.title} />}</div>
                                        <span>{item.title} <small>{Object.values(item.attributes || {}).join(' / ')} · QTY {item.quantity}</small></span>
                                    </li>
                                ))}
                            </ul>

                            <div className="seller-order-meta">
                                {order.customer && <p><strong>{order.customer.name}</strong> · {order.customer.email}</p>}
                                {order.shippingAddress?.line1 && (
                                    <p>Ship to: {order.shippingAddress.name}, {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode} · {order.shippingAddress.phone}</p>
                                )}
                                {order.returnReason && order.orderStatus === 'return_requested' && <p>Return reason: “{order.returnReason}”</p>}
                            </div>

                            {order.nextStatuses.length > 0 && (
                                <div className="seller-actions">
                                    {order.nextStatuses.map(status => (
                                        <button key={status} type="button" disabled={busyId === order.orderId} onClick={() => change(order.orderId, status)}>
                                            {status === 'delivered' && order.orderStatus === 'return_requested' ? 'Reject return' : ACTION_LABELS[ status ]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
};

export default SellerOrders;
