import { useDeferredValue, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { getAllProducts } from '../service/product.api';
import { setProducts } from '../state/product.slice';
import './Home.css';

const filters = [ 'All shirts', 'Oversized', 'Printed', 'Regular fit' ];

const Home = () => {
    const dispatch = useDispatch();
    const products = useSelector(state => state.product.products);
    const [ activeFilter, setActiveFilter ] = useState('All shirts');
    const [ search, setSearch ] = useState('');
    const [ sort, setSort ] = useState('featured');
    const [ isLoading, setIsLoading ] = useState(true);
    const [ hasError, setHasError ] = useState(false);
    const deferredSearch = useDeferredValue(search.trim().toLowerCase());

    useEffect(() => {
        getAllProducts()
            .then(data => dispatch(setProducts(data.products)))
            .catch(() => setHasError(true))
            .finally(() => setIsLoading(false));
    }, [ dispatch ]);

    const visibleProducts = (products || [])
        .filter(product => {
            const searchableText = `${product.title} ${product.description}`.toLowerCase();
            const matchesSearch = searchableText.includes(deferredSearch);
            const matchesFilter = activeFilter === 'All shirts'
                || (activeFilter === 'Oversized' && /oversized|box fit/i.test(searchableText))
                || (activeFilter === 'Printed' && /print|geometric|paisley|floral/i.test(searchableText))
                || (activeFilter === 'Regular fit' && /regular fit/i.test(searchableText));

            return matchesSearch && matchesFilter;
        })
        .sort((first, second) => {
            if (sort === 'price-low') return first.price.amount - second.price.amount;
            if (sort === 'price-high') return second.price.amount - first.price.amount;
            if (sort === 'latest') return new Date(second.createdAt) - new Date(first.createdAt);
            return 0;
        });

    const formatPrice = amount => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

    return (
        <main className="snitch-home">
            <link
                href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <div className="snitch-promo">
                <span>THE NEW DROP IS HERE</span>
                <span className="snitch-promo__divider">/</span>
                <span>MADE FOR YOUR NEXT MOVE</span>
            </div>

            <section className="snitch-hero" aria-label="New shirt collection">
                <div className="snitch-hero__copy">
                    <p className="snitch-eyebrow"><span /> NEW SEASON / 026</p>
                    <h1>WEAR<br />YOUR<br /><span>OWN RULES.</span></h1>
                    <p className="snitch-hero__description">Big fits. Better prints. Shirts that do the talking before you do.</p>
                    <a className="snitch-hero__cta" href="#product-feed">SHOP THE DROP <span aria-hidden="true">↘</span></a>
                    <span className="snitch-hero__index">01 — 07</span>
                </div>
                <div className="snitch-hero__image">
                    <img
                        src="https://cdn.shopify.com/s/files/1/0420/7073/7058/files/1_c58c413c-65b0-4497-99d8-aaa73781c300.png?v=1790097314&width=1600&quality=100"
                        srcSet="https://cdn.shopify.com/s/files/1/0420/7073/7058/files/1_c58c413c-65b0-4497-99d8-aaa73781c300.png?v=1790097314&width=1200&quality=100 1200w, https://cdn.shopify.com/s/files/1/0420/7073/7058/files/1_c58c413c-65b0-4497-99d8-aaa73781c300.png?v=1790097314&width=1600&quality=100 1600w, https://cdn.shopify.com/s/files/1/0420/7073/7058/files/1_c58c413c-65b0-4497-99d8-aaa73781c300.png?v=1790097314&width=2400&quality=100 2400w, https://cdn.shopify.com/s/files/1/0420/7073/7058/files/1_c58c413c-65b0-4497-99d8-aaa73781c300.png?v=1790097314&width=2528&quality=100 2528w"
                        sizes="(max-width: 900px) 100vw, 50vw"
                        alt="SNITCH Stay Sunny placement print shirt"
                        fetchPriority="high"
                        decoding="async"
                    />
                    <span className="snitch-hero__image-tag">MADE FOR THE<br />AFTER HOURS</span>
                </div>
            </section>

            <section className="snitch-feed" id="product-feed">
                <div className="snitch-feed__heading">
                    <div>
                        <p className="snitch-eyebrow">FRESH OFF THE RACK</p>
                        <h2>THE SHIRT EDIT<span>.</span></h2>
                    </div>
                    <p className="snitch-feed__note">Fits for wherever the day takes you.</p>
                </div>

                <div className="snitch-controls">
                    <div className="snitch-filters" role="group" aria-label="Filter shirts">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                type="button"
                                className={activeFilter === filter ? 'is-active' : ''}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="snitch-tools">
                        <label className="snitch-search">
                            <span className="snitch-search__icon" aria-hidden="true">⌕</span>
                            <input
                                type="search"
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder="Find your fit"
                                aria-label="Search products"
                            />
                        </label>
                        <label className="snitch-sort">
                            <span className="snitch-sort__label">SORT</span>
                            <select value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort products">
                                <option value="featured">Featured</option>
                                <option value="latest">Latest</option>
                                <option value="price-low">Price: low to high</option>
                                <option value="price-high">Price: high to low</option>
                            </select>
                        </label>
                    </div>
                </div>

                <div className="snitch-results-count">
                    {isLoading ? 'LOADING THE DROP' : `${visibleProducts.length} STYLES`}
                </div>

                {isLoading ? (
                    <div className="snitch-empty">Loading the latest fits...</div>
                ) : hasError ? (
                    <div className="snitch-empty">
                        <h3>THE RACK IS OFFLINE.</h3>
                        <p>Start the backend and refresh to load the collection.</p>
                        <button type="button" onClick={() => window.location.reload()}>TRY AGAIN</button>
                    </div>
                ) : visibleProducts.length ? (
                    <div className="snitch-grid">
                        {visibleProducts.map((product, index) => {
                            const imageUrl = product.images?.[0]?.url;
                            const fit = product.variants?.[0]?.attributes?.Fit || 'Everyday fit';

                            return (
                                <Link to={`/product/${product._id}`} key={product._id} className="snitch-product">
                                    <div className="snitch-product__image">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={product.title} loading={index > 3 ? 'lazy' : 'eager'} />
                                        ) : (
                                            <div className="snitch-product__no-image">SNITCH.</div>
                                        )}
                                        <span className={`snitch-product__badge ${index % 3 === 1 ? 'snitch-product__badge--lime' : ''}`}>
                                            {index === 0 ? 'JUST DROPPED' : index % 3 === 1 ? 'TRENDING' : 'NEW SEASON'}
                                        </span>
                                        <span className="snitch-product__arrow" aria-hidden="true">↗</span>
                                    </div>
                                    <div className="snitch-product__details">
                                        <div>
                                            <p className="snitch-product__fit">{fit}</p>
                                            <h3>{product.title}</h3>
                                        </div>
                                        <p className="snitch-product__price">{formatPrice(product.price?.amount)}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="snitch-empty">
                        <h3>NO MATCHES. YET.</h3>
                        <p>Try another search or clear the current filter.</p>
                        <button type="button" onClick={() => { setSearch(''); setActiveFilter('All shirts'); }}>SHOW ALL SHIRTS</button>
                    </div>
                )}
            </section>

            <footer className="snitch-footer">
                <span>SNITCH.</span>
                <span>MADE FOR THE WAY YOU MOVE.</span>
                <span>© {new Date().getFullYear()}</span>
            </footer>
        </main>
    );
};

export default Home;