import { useEffect, useEffectEvent, useState } from 'react';
import { Link } from 'react-router';
import { useWishlist } from '../hook/useWishlist';
import WishlistButton from '../components/WishlistButton';
import { formatPrice } from '../../Shared/utils/format';
import { SkeletonGrid } from '../../Shared/Components/Skeleton';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';

const Wishlist = () => {
    usePageMeta({ title: 'Wishlist' });
    const { products, loadWishlist } = useWishlist();
    const [ loading, setLoading ] = useState(true);

    const load = useEffectEvent(() => loadWishlist().finally(() => setLoading(false)));

    useEffect(() => {
        load();
    }, []);

    return (
        <main className="page-shell">
            <p className="page-shell__eyebrow">SAVED FOR LATER</p>
            <h1 className="page-shell__title">Your wishlist</h1>

            {loading ? (
                <SkeletonGrid count={4} />
            ) : products.length ? (
                <div className="mini-grid">
                    {products.map(product => (
                        <Link to={`/product/${product._id}`} key={product._id} className="mini-card">
                            <div className="mini-card__image">
                                {product.images?.[0]?.url ? <img src={product.images[0].url} alt={product.title} loading="lazy" /> : <span>SNITCH.</span>}
                                <WishlistButton product={product} className="mini-card__heart" />
                            </div>
                            <h3>{product.title}</h3>
                            <p>{formatPrice(product.price?.amount)}</p>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="page-shell__empty">
                    <h2>Nothing saved yet.</h2>
                    <p>Tap the heart on any shirt to keep it here.</p>
                    <Link to="/" className="btn-solid">EXPLORE THE DROP</Link>
                </div>
            )}
        </main>
    );
};

export default Wishlist;
