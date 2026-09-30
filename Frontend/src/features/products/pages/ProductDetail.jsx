import React, { useEffect, useEffectEvent, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useProduct } from '../hooks/useProduct';
import { useCart } from '../../cart/hook/useCart';
import WishlistButton from '../../wishlist/components/WishlistButton';
import Reviews from '../components/Reviews';
import Stars from '../components/Stars';
import { getAllProducts } from '../service/product.api';
import { formatPrice } from '../../Shared/utils/format';
import { useToast } from '../../Shared/hooks/useToast';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';
import { addGuestItem } from '../../guest/guestCart.slice';
import { SkeletonProduct } from '../../Shared/Components/Skeleton';
import SizeGuide from '../components/SizeGuide';
import RecentlyViewed from '../components/RecentlyViewed';
import { recordViewed } from '../../Shared/utils/recentlyViewed';

const ProductDetail = () => {
    const { productId } = useParams();
    const [ product, setProduct ] = useState(null);
    const [ selectedImage, setSelectedImage ] = useState(0);
    const [ selectedAttributes, setSelectedAttributes ] = useState({});
    const [ showSizeGuide, setShowSizeGuide ] = useState(false);
    const { toast } = useToast();
    const dispatch = useDispatch();
    const [ loadFailed, setLoadFailed ] = useState(false);
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const { handleGetProductById } = useProduct();
    const { handleAddItem } = useCart()
    const [ ratingSummary, setRatingSummary ] = useState({ count: 0, average: 0 });
    const [ allProducts, setAllProducts ] = useState([]);
    const [ shareMessage, setShareMessage ] = useState('');




    const fetchProductDetails = useEffectEvent(async () => {
        setProduct(null);
        setSelectedImage(0);
        try {
            const data = await handleGetProductById(productId);
            const loadedProduct = data?.product || data;
            setProduct(loadedProduct);
            setSelectedAttributes(loadedProduct?.variants?.[0]?.attributes || {});
            setLoadFailed(false);
        } catch (error) {
            console.error("Failed to fetch product details", error);
            setLoadFailed(true);
        }
    });

    useEffect(() => {
        fetchProductDetails();
    }, [ productId ]);

    usePageMeta({
        title: product?.title,
        description: product?.description?.slice(0, 155),
        image: product?.images?.[0]?.url,
    });

    useEffect(() => {
        if (product) recordViewed(product);
    }, [ product ]);

    useEffect(() => {
        getAllProducts().then(data => setAllProducts(data.products)).catch(() => { });
    }, []);

    const handleShare = async () => {
        const url = window.location.href;
        try {
            if (navigator.share) {
                await navigator.share({ title: product.title, url });
            } else {
                await navigator.clipboard.writeText(url);
                setShareMessage('Link copied.');
                setTimeout(() => setShareMessage(''), 2000);
            }
        } catch { /* share dismissed */ }
    };

    const activeVariant = useMemo(() => {
        if (!product?.variants || product.variants.length === 0) return null;
        return product.variants.find(v => {
            if (!v.attributes) return false;
            const vKeys = Object.keys(v.attributes);
            const sKeys = Object.keys(selectedAttributes);
            const isMatch = vKeys.every(k => v.attributes[ k ] === selectedAttributes[ k ]);
            // If they don't have exactly the same keys, they shouldn't perfectly match, 
            // but we might only care about matching what's available.
            return vKeys.length === sKeys.length && isMatch;
        });
    }, [ product, selectedAttributes ]);


    const availableAttributes = useMemo(() => {
        if (!product?.variants) return {};
        const attrs = {};
        product.variants.forEach(variant => {
            if (variant.attributes) {
                Object.entries(variant.attributes).forEach(([ key, value ]) => {
                    if (!attrs[ key ]) attrs[ key ] = new Set();
                    attrs[ key ].add(value);
                });
            }
        });
        Object.keys(attrs).forEach(key => {
            attrs[ key ] = Array.from(attrs[ key ]);
        });
        return attrs;
    }, [ product ]);

    const handleAttributeChange = (attrName, value) => {
        const newAttrs = { ...selectedAttributes, [ attrName ]: value };

        // Find if an exact match exists for this combination
        const exactMatch = product.variants.find(v => {
            const vAttrs = v.attributes || {};
            return Object.keys(newAttrs).every(k => newAttrs[ k ] === vAttrs[ k ]) &&
                Object.keys(vAttrs).every(k => newAttrs[ k ] === vAttrs[ k ]);
        });

        if (exactMatch) {
            setSelectedAttributes(exactMatch.attributes);
            setSelectedImage(0);
        } else {
            // Find any variant that has this newly selected attribute to fallback nicely
            const fallbackVariant = product.variants.find(v => v.attributes && v.attributes[ attrName ] === value);
            if (fallbackVariant) {
                setSelectedAttributes(fallbackVariant.attributes);
            } else {
                setSelectedAttributes(newAttrs);
            }
        }
    };

    if (!product) {
        return (
            <div className="min-h-[60vh] max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 xl:px-24 pt-12">
                {loadFailed ? (
                    <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#B5ADA3' }}>Product could not be found.</p>
                ) : (
                    <SkeletonProduct />
                )}
            </div>
        );
    }

    const handlePurchaseAction = async (checkout = false) => {
        if (!activeVariant) {
            toast('Select an available size before continuing.', 'error');
            return;
        }

        if (activeVariant.stock <= 0) {
            toast('This size is currently out of stock.', 'error');
            return;
        }

        if (!user) {
            // guests keep a cart on this device; it moves to their account when they sign in
            dispatch(addGuestItem({
                productId: product._id,
                variantId: activeVariant._id,
                stock: activeVariant.stock,
                title: product.title,
                image: (activeVariant.images?.[0] || product.images?.[0])?.url || '',
                price: (activeVariant.price?.amount ?? product.price?.amount),
                currency: product.price?.currency,
                attributes: activeVariant.attributes || {},
            }));

            if (checkout) {
                navigate('/login', { state: { redirectTo: '/checkout' } });
            } else {
                toast('Added to your cart.', 'success');
            }
            return;
        }

        try {
            await handleAddItem({ productId: product._id, variantId: activeVariant._id });
            if (checkout) {
                navigate('/checkout');
            } else {
                toast('Added to your cart.', 'success');
            }
        } catch (error) {
            toast(error.response?.data?.message || 'Could not add this item. Please try again.', 'error');
        }
    };

    // Fallbacks
    const displayImages = (activeVariant?.images && activeVariant.images.length > 0)
        ? activeVariant.images
        : (product.images && product.images.length > 0 ? product.images : [ { url: '/snitch_editorial_warm.png' } ]);

    const related = allProducts.filter(item => item._id !== product._id).slice(0, 4);

    const displayPrice = activeVariant?.price?.amount
        ? activeVariant.price
        : product.price;

    return (
        <>
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <div
                className="min-h-screen selection:bg-[#C9A96E]/30 pb-24"
                style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}
            >

                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 xl:px-24 pt-8 lg:pt-20">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">

                        {/* ── LEFT: Image Gallery ── */}
                        <div className="w-full lg:w-[70%] flex flex-col-reverse md:flex-row gap-4 lg:gap-6">

                            {/* Thumbnails (Vertical on Desktop, Horizontal on Mobile) */}
                            {displayImages.length > 1 && (
                                <div className="flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-20 lg:w-24 flex-shrink-0 md:max-h-[calc(100vh-200px)]">
                                    {displayImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={`flex-shrink-0 w-20 md:w-full aspect-[4/5] overflow-hidden transition-all duration-300 ${selectedImage === idx ? 'opacity-100 ring-1 ring-[#C9A96E] ring-offset-2' : 'opacity-50 hover:opacity-100'}`}
                                            style={{ backgroundColor: '#f5f3f0', '--tw-ring-offset-color': '#fbf9f6' }}
                                        >
                                            <img

                                                src={img.url} alt={`View ${idx + 1}`} className="w-full h-full object-cover object-top" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main Image */}
                            <div className="relative w-full aspect-4/5 overflow-hidden group" style={{ backgroundColor: '#f5f3f0' }}>
                                <img
                                    src={displayImages[ selectedImage ]?.url || displayImages[ 0 ].url}
                                    alt={product.title}
                                    className="w-full h-full object-cover object-top transition-opacity duration-500"

                                />
                                {displayImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedImage(prev => prev === 0 ? displayImages.length - 1 : prev - 1)}
                                            className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border"
                                            style={{ backgroundColor: 'rgba(251,249,246,0.8)', borderColor: '#e4e2df', color: '#1b1c1a' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fbf9f6'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(251,249,246,0.8)'}
                                            aria-label="Previous image"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button
                                            onClick={() => setSelectedImage(prev => prev === displayImages.length - 1 ? 0 : prev + 1)}
                                            className="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border"
                                            style={{ backgroundColor: 'rgba(251,249,246,0.8)', borderColor: '#e4e2df', color: '#1b1c1a' }}
                                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fbf9f6'}
                                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(251,249,246,0.8)'}
                                            aria-label="Next image"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ── RIGHT: Product Details ── */}
                        <div className="w-full lg:w-[30%] lg:sticky lg:top-24 flex flex-col pt-4">

                            <h1
                                className="text-4xl md:text-5xl lg:text-6xl font-light leading-[1.05] mb-4 break-words"
                                style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1b1c1a' }}
                            >
                                {product.title}
                            </h1>

                            {ratingSummary.count > 0 && (
                                <a href="#reviews" className="flex items-center gap-2 mb-4 text-xs" style={{ color: '#7A6E63' }}>
                                    <Stars value={ratingSummary.average} /> {ratingSummary.average} ({ratingSummary.count})
                                </a>
                            )}

                            <div className="mb-8">
                                <span
                                    className="text-sm uppercase tracking-[0.2em] font-medium"
                                    style={{ color: '#1b1c1a' }}
                                >
                                    {displayPrice?.currency} {displayPrice?.amount?.toLocaleString()}
                                </span>
                            </div>

                            <div className="h-px w-full mb-8" style={{ backgroundColor: '#e4e2df' }} />

                            {/* Options/Variants */}
                            {Object.entries(availableAttributes).map(([ attrName, values ]) => (
                                <div key={attrName} className="mb-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[10px] uppercase tracking-[0.24em] font-medium" style={{ color: '#C9A96E' }}>
                                            {attrName}
                                        </h3>
                                        {/size/i.test(attrName) && (
                                            <button type="button" className="link-btn" onClick={() => setShowSizeGuide(true)}>SIZE GUIDE</button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {values.map(val => {
                                            const isSelected = selectedAttributes[ attrName ] === val;
                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() => handleAttributeChange(attrName, val)}
                                                    className={`px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-medium transition-all duration-300 border ${isSelected ? 'border-[#1b1c1a] bg-[#1b1c1a] text-[#fbf9f6]' : 'border-[#d0c5b5] text-[#1b1c1a] hover:border-[#1b1c1a]'}`}
                                                    style={isSelected ? {} : { backgroundColor: 'transparent' }}
                                                >
                                                    {val}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Stock Information */}
                            {activeVariant && activeVariant.stock !== undefined && (
                                <div className="mb-6">
                                    <span className={`text-[10px] uppercase tracking-[0.2em] font-medium ${activeVariant.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {activeVariant.stock > 0 ? `${activeVariant.stock} in stock` : 'Out of stock'}
                                    </span>
                                </div>
                            )}

                            <div className="mb-12">
                                <h3 className="text-[10px] uppercase tracking-[0.24em] font-medium mb-4" style={{ color: '#C9A96E' }}>
                                    The Details
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: '#7A6E63' }}>
                                    {product.description}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-4 mt-auto">
                                <button
                                    disabled={!activeVariant || activeVariant.stock <= 0}
                                    className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300"
                                    style={{
                                        backgroundColor: '#1b1c1a',
                                        color: '#fbf9f6',
                                        fontFamily: "'Inter', sans-serif"
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = '#C9A96E';
                                        e.currentTarget.style.color = '#1b1c1a';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = '#1b1c1a';
                                        e.currentTarget.style.color = '#fbf9f6';
                                    }}
                                    onClick={() => handlePurchaseAction()}
                                >
                                    Add to Cart
                                </button>

                                <button
                                    disabled={!activeVariant || activeVariant.stock <= 0}
                                    className="w-full py-4 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 border"
                                    style={{
                                        backgroundColor: 'transparent',
                                        borderColor: '#d0c5b5',
                                        color: '#1b1c1a',
                                        fontFamily: "'Inter', sans-serif"
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#C9A96E';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#d0c5b5';
                                    }}
                                    onClick={() => handlePurchaseAction(true)}
                                >
                                    Buy Now
                                </button>

                                <div className="flex gap-3">
                                    <WishlistButton product={product} className="wishlist-btn--inline" />
                                    <button type="button" onClick={handleShare} className="share-btn">
                                        {shareMessage || 'SHARE'}
                                    </button>
                                </div>
                            </div>

                            {/* Extra elegant details */}
                            <div className="mt-14 space-y-4 text-[10px] uppercase tracking-[0.1em]" style={{ color: '#B5ADA3' }}>
                                <div className="flex justify-between border-b pb-3" style={{ borderColor: '#e4e2df' }}>
                                    <span>Shipping</span>
                                    <span>Complimentary over INR 15,000</span>
                                </div>
                                <div className="flex justify-between border-b pb-3" style={{ borderColor: '#e4e2df' }}>
                                    <span>Returns</span>
                                    <span>Within 14 days of delivery</span>
                                </div>
                                <div className="flex justify-between border-b pb-3" style={{ borderColor: '#e4e2df' }}>
                                    <span>Authenticity</span>
                                    <span>100% Guaranteed</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div id="reviews">
                        <Reviews productId={product._id} onSummary={setRatingSummary} />
                    </div>

                    <RecentlyViewed excludeId={product._id} />

                    {related.length > 0 && (
                        <section className="related" aria-label="You may also like">
                            <h2>You may also like</h2>
                            <div className="mini-grid">
                                {related.map(item => (
                                    <Link to={`/product/${item._id}`} key={item._id} className="mini-card">
                                        <div className="mini-card__image">
                                            {item.images?.[0]?.url ? <img src={item.images[0].url} alt={item.title} loading="lazy" /> : <span>SNITCH.</span>}
                                            <WishlistButton product={item} className="mini-card__heart" />
                                        </div>
                                        <h3>{item.title}</h3>
                                        <p>{formatPrice(item.price?.amount)}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {showSizeGuide && <SizeGuide onClose={() => setShowSizeGuide(false)} />}
        </>
    );
};

export default ProductDetail;