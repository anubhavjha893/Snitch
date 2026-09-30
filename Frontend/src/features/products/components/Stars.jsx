const Stars = ({ value = 0, size = 14 }) => (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`} style={{ fontSize: size }}>
        {[ 1, 2, 3, 4, 5 ].map(star => (
            <span key={star} className={star <= Math.round(value) ? 'is-on' : ''}>★</span>
        ))}
    </span>
);

export default Stars;
