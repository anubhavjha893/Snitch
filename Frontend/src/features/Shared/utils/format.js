export const formatPrice = (amount, currency = 'INR') => {
    const symbol = currency === 'INR' ? '₹' : `${currency} `;
    return `${symbol}${Number(amount || 0).toLocaleString('en-IN')}`;
};

export const formatDate = value => value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
