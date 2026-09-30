import { useState } from 'react';
import { Link } from 'react-router';
import { forgotPassword } from '../service/auth.api';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';

const ForgotPassword = () => {
    usePageMeta({ title: 'Forgot password' });

    const [ email, setEmail ] = useState('');
    const [ sending, setSending ] = useState(false);
    const [ message, setMessage ] = useState('');
    const [ error, setError ] = useState('');

    const submit = async event => {
        event.preventDefault();
        setSending(true);
        setError('');

        try {
            const data = await forgotPassword(email);
            setMessage(data.message);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not send the reset link. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <main className="account-page">
            <div className="account-page__eyebrow">ACCOUNT / RECOVERY</div>
            <h1>Forgot password</h1>
            <p className="account-page__intro">Enter your email and we will send you a link to choose a new password.</p>

            <form className="account-form" onSubmit={submit}>
                <label>
                    Email address
                    <input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" />
                </label>
                {message && <p className="account-form__message" role="status">{message}</p>}
                {error && <p className="account-form__error" role="alert">{error}</p>}
                <button type="submit" disabled={sending}>{sending ? 'SENDING...' : 'SEND RESET LINK'}</button>
                <Link to="/login" className="checkout__back">← Back to sign in</Link>
            </form>
        </main>
    );
};

export default ForgotPassword;
