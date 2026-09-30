import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { getSellerAnalytics } from '../service/seller.api';
import SellerTabs from '../components/SellerTabs';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';
import { ORDER_STATUS_LABELS } from '../../Shared/utils/constants';
import { formatPrice } from '../../Shared/utils/format';

const SellerAnalytics = () => {
    usePageMeta({ title: 'Seller analytics' });
    const [ data, setData ] = useState(null);
    const [ error, setError ] = useState('');

    useEffect(() => {
        getSellerAnalytics().then(response => setData(response.analytics)).catch(() => setError('Could not load analytics.'));
    }, []);

    const maxRevenue = data ? Math.max(...data.last14.map(day => day.revenue), 1) : 1;

    return (
        <main className="page-shell">
            <p className="page-shell__eyebrow">SELLER</p>
            <h1 className="page-shell__title">Analytics</h1>
            <SellerTabs />

            {error && <p className="page-shell__note">{error}</p>}
            {!data && !error && <div className="skeleton skeleton--row" />}

            {data && (
                <>
                    <div className="stat-grid">
                        <div className="stat"><span>REVENUE</span><strong>{formatPrice(data.revenue)}</strong></div>
                        <div className="stat"><span>ORDERS</span><strong>{data.orders}</strong></div>
                        <div className="stat"><span>UNITS SOLD</span><strong>{data.units}</strong></div>
                    </div>

                    <section className="analytics-card">
                        <h2>Last 14 days</h2>
                        <div className="bars" role="img" aria-label="Revenue per day for the last 14 days">
                            {data.last14.map(day => (
                                <div key={day.date} className="bars__col" title={`${day.date}: ${formatPrice(day.revenue)}`}>
                                    <div className="bars__bar" style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, day.revenue ? 4 : 1)}%` }} />
                                    <small>{day.date.slice(8)}</small>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="analytics-two">
                        <section className="analytics-card">
                            <h2>Top products</h2>
                            {data.topProducts.length === 0 ? <p className="page-shell__note">No sales yet.</p> : (
                                <ol className="rank-list">
                                    {data.topProducts.map(product => (
                                        <li key={product._id}>
                                            <Link to={`/seller/product/${product._id}`}>{product.title}</Link>
                                            <span>{product.units} sold · {formatPrice(product.revenue)}</span>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </section>

                        <section className="analytics-card">
                            <h2>Low stock <small>(5 or fewer)</small></h2>
                            {data.lowStock.length === 0 ? <p className="page-shell__note">Everything is well stocked.</p> : (
                                <ul className="rank-list">
                                    {data.lowStock.map((item, index) => (
                                        <li key={`${item.productId}-${index}`}>
                                            <Link to={`/seller/product/${item.productId}`}>{item.title} <small>{Object.values(item.attributes).join(' / ')}</small></Link>
                                            <span className={item.stock === 0 ? 'text-danger' : ''}>{item.stock === 0 ? 'Out of stock' : `${item.stock} left`}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    </div>

                    <section className="analytics-card">
                        <h2>Orders by status</h2>
                        <div className="chip-row">
                            {Object.entries(data.statusCounts).map(([ status, count ]) => (
                                <span key={status} className={`status-badge status-badge--${status}`}>{ORDER_STATUS_LABELS[ status ] || status}: {count}</span>
                            ))}
                            {Object.keys(data.statusCounts).length === 0 && <p className="page-shell__note">No orders yet.</p>}
                        </div>
                    </section>
                </>
            )}
        </main>
    );
};

export default SellerAnalytics;
