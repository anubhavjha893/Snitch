import { useState } from 'react';
import { Link } from 'react-router';
import { formatPrice } from '../../Shared/utils/format';
import { readViewed } from '../../Shared/utils/recentlyViewed';

const RecentlyViewed = ({ excludeId = null }) => {
    // read once per mount: keeps the list stable while the user stays on the page
    const [ items ] = useState(() => readViewed().filter(item => item._id !== excludeId).slice(0, 4));

    if (!items.length) return null;

    return (
        <section className="related" aria-label="Recently viewed">
            <h2>Recently viewed</h2>
            <div className="mini-grid">
                {items.map(item => (
                    <Link to={`/product/${item._id}`} key={item._id} className="mini-card">
                        <div className="mini-card__image">
                            {item.image ? <img src={item.image} alt={item.title} loading="lazy" /> : <span>SNITCH.</span>}
                        </div>
                        <h3>{item.title}</h3>
                        <p>{formatPrice(item.price)}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default RecentlyViewed;
