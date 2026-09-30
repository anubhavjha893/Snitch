export const SkeletonGrid = ({ count = 8 }) => (
    <div className="snitch-grid" aria-busy="true" aria-label="Loading products">
        {Array.from({ length: count }, (_, index) => (
            <div key={index} className="skeleton-card">
                <div className="skeleton skeleton--image" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line skeleton--short" />
            </div>
        ))}
    </div>
);

export const SkeletonRows = ({ count = 3 }) => (
    <div className="order-list" aria-busy="true" aria-label="Loading">
        {Array.from({ length: count }, (_, index) => (
            <div key={index} className="skeleton skeleton--row" />
        ))}
    </div>
);

export const SkeletonProduct = () => (
    <div className="skeleton-product" aria-busy="true" aria-label="Loading product">
        <div className="skeleton skeleton--tall" />
        <div>
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line skeleton--short" />
            <div className="skeleton skeleton--button" />
        </div>
    </div>
);
