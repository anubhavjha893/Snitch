const STORAGE_KEY = 'snitch-recently-viewed';
const MAX_ITEMS = 8;

export const readViewed = () => {
    try {
        const list = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
};

export const recordViewed = product => {
    try {
        const entry = {
            _id: product._id,
            title: product.title,
            image: product.images?.[0]?.url || '',
            price: product.price?.amount,
        };
        const list = [ entry, ...readViewed().filter(item => item._id !== product._id) ].slice(0, MAX_ITEMS);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch { /* storage unavailable */ }
};
