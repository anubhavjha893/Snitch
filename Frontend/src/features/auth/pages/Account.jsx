import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router';
import { updateProfile } from '../service/auth.api';
import { setUser } from '../state/auth.slice';
import AddressBook from '../../addresses/components/AddressBook';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';

const Account = () => {
    usePageMeta({ title: 'My account' });
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    const [ fullname, setFullname ] = useState(user?.fullname || '');
    const [ contact, setContact ] = useState(user?.contact || '');
    const [ isSaving, setIsSaving ] = useState(false);
    const [ message, setMessage ] = useState('');
    const [ error, setError ] = useState('');

    const handleSubmit = async event => {
        event.preventDefault();
        setIsSaving(true);
        setMessage('');
        setError('');

        try {
            const data = await updateProfile({ fullname, contact });
            dispatch(setUser(data.user));
            setMessage('Your details have been updated.');
        } catch (requestError) {
            setError(requestError.response?.data?.errors?.[0]?.msg || requestError.response?.data?.message || 'Could not update your details.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="account-page">
            <div className="account-page__eyebrow">YOUR ACCOUNT / DETAILS</div>
            <h1>Account details</h1>
            <p className="account-role">
                <span className={`role-badge role-badge--${user?.role}`}>
                    {user?.role === 'seller' ? 'SELLER / ADMIN' : 'BUYER / USER'}
                </span>
                {user?.role === 'seller' && <Link to="/seller/dashboard" className="link-btn">OPEN SELLER DASHBOARD</Link>}
            </p>
            <p className="account-page__intro">Keep your contact details up to date for a smoother checkout.</p>

            <form className="account-form" onSubmit={handleSubmit}>
                <label>
                    Full name
                    <input value={fullname} onChange={event => setFullname(event.target.value)} minLength="3" maxLength="80" required />
                </label>
                <label>
                    Email address
                    <input type="email" value={user?.email || ''} readOnly />
                </label>
                <label>
                    Mobile number
                    <input type="tel" value={contact} onChange={event => setContact(event.target.value)} pattern="[0-9]{10}" maxLength="10" required />
                </label>
                {message && <p className="account-form__message" role="status">{message}</p>}
                {error && <p className="account-form__error" role="alert">{error}</p>}
                <button type="submit" disabled={isSaving}>{isSaving ? 'SAVING...' : 'SAVE DETAILS'}</button>
            </form>

            <section className="account-section">
                <h2>Saved addresses</h2>
                <p className="account-page__intro">Used for delivery at checkout.</p>
                <AddressBook />
            </section>
        </main>
    );
};

export default Account;