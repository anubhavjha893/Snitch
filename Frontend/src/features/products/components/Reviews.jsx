import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { deleteReview, getReviews, saveReview } from '../service/product.api';
import { formatDate } from '../../Shared/utils/format';
import Stars from './Stars';

const Reviews = ({ productId, onSummary }) => {
    const user = useSelector(state => state.auth.user);
    const [ reviews, setReviews ] = useState([]);
    const [ summary, setSummary ] = useState({ count: 0, average: 0 });
    const [ rating, setRating ] = useState(0);
    const [ comment, setComment ] = useState('');
    const [ message, setMessage ] = useState('');
    const [ saving, setSaving ] = useState(false);

    const load = useCallback(async () => {
        const data = await getReviews(productId);
        setReviews(data.reviews);
        setSummary(data.summary);
        onSummary?.(data.summary);
        return data.reviews;
    }, [ productId, onSummary ]);

    useEffect(() => {
        load().then(list => {
            const mine = list.find(review => review.user === user?.id);
            setRating(mine?.rating || 0);
            setComment(mine?.comment || '');
        }).catch(() => { });
    }, [ load, user?.id ]);

    const myReview = reviews.find(review => review.user === user?.id);

    const submit = async event => {
        event.preventDefault();
        if (!rating) {
            setMessage('Please choose a star rating.');
            return;
        }
        setSaving(true);
        try {
            await saveReview(productId, { rating, comment });
            await load();
            setMessage('Thanks — your review is live.');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Could not save your review.');
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        await deleteReview(productId);
        setRating(0);
        setComment('');
        setMessage('Review removed.');
        await load();
    };

    return (
        <section className="reviews" aria-label="Customer reviews">
            <div className="reviews__head">
                <h2>Reviews</h2>
                {summary.count > 0 && (
                    <p><Stars value={summary.average} size={16} /> <strong>{summary.average}</strong> · {summary.count} review{summary.count > 1 ? 's' : ''}</p>
                )}
            </div>

            {user ? (
                <form className="reviews__form" onSubmit={submit}>
                    <p className="reviews__label">{myReview ? 'Edit your review' : 'Write a review'}</p>
                    <div className="reviews__pick" role="radiogroup" aria-label="Rating">
                        {[ 1, 2, 3, 4, 5 ].map(star => (
                            <button
                                key={star}
                                type="button"
                                role="radio"
                                aria-checked={rating === star}
                                aria-label={`${star} star${star > 1 ? 's' : ''}`}
                                className={star <= rating ? 'is-on' : ''}
                                onClick={() => setRating(star)}
                            >★</button>
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={event => setComment(event.target.value)}
                        maxLength={1000}
                        rows={3}
                        placeholder="How does it fit? How does it feel?"
                        aria-label="Your review"
                    />
                    <div className="reviews__actions">
                        <button type="submit" className="btn-solid" disabled={saving}>{saving ? 'SAVING...' : myReview ? 'UPDATE REVIEW' : 'POST REVIEW'}</button>
                        {myReview && <button type="button" className="btn-ghost" onClick={remove}>DELETE</button>}
                    </div>
                    {message && <p role="status" className="reviews__msg">{message}</p>}
                </form>
            ) : (
                <p className="reviews__login"><Link to="/login" state={{ redirectTo: `/product/${productId}` }}>Sign in</Link> to leave a review.</p>
            )}

            {reviews.length ? (
                <ul className="reviews__list">
                    {reviews.map(review => (
                        <li key={review._id}>
                            <div className="reviews__meta">
                                <strong>{review.userName}</strong>
                                {review.verifiedPurchase && <span className="reviews__badge">VERIFIED BUYER</span>}
                                <span>{formatDate(review.createdAt)}</span>
                            </div>
                            <Stars value={review.rating} />
                            {review.comment && <p>{review.comment}</p>}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="reviews__empty">No reviews yet — be the first.</p>
            )}
        </section>
    );
};

export default Reviews;
