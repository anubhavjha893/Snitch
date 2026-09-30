import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { resetPassword } from '../service/auth.api';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';
import { useToast } from '../../Shared/hooks/useToast';

const ResetPassword = () => {
    usePageMeta({ title: 'Reset password' });

    const [ params ] = useSearchParams();
    const token = params.get('token');
    const navigate = useNavigate();
    const { toast } = useToast();
    const [ password, setPassword ] = useState('');
    const [ confirm, setConfirm ] = useState('');
    const [ saving, setSaving ] = useState(false);
    const [ error, setError ] = useState('');

    const submit = async event => {
        event.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('The two passwords do not match.');
            return;
        }

        setSaving(true);

        try {
            await resetPassword({ token, password });
            toast('Password updated. Please sign in.', 'success');
            navigate('/login');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not reset your password.');
        } finally {
            setSaving(false);
        }
    };

    if (!token) {
        return (
            <main className="account-page">
                <h1>Link not valid</h1>
                <p className="account-page__intro">This reset link is missing or incomplete.</p>
                <Link to="/forgot-password" className="btn-solid">REQUEST A NEW LINK</Link>
            </main>
        );
    }

    return (
        <main className="account-page">
            <div className="account-page__eyebrow">ACCOUNT / RECOVERY</div>
            <h1>New password</h1>
            <p className="account-page__intro">Choose a password with at least 6 characters.</p>

            <form className="account-form" onSubmit={submit}>
                <label>
                    New password
                    <input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength="6" required autoComplete="new-password" />
                </label>
                <label>
                    Confirm password
                    <input type="password" value={confirm} onChange={event => setConfirm(event.target.value)} minLength="6" required autoComplete="new-password" />
                </label>
                {error && <p className="account-form__error" role="alert">{error}</p>}
                <button type="submit" disabled={saving}>{saving ? 'SAVING...' : 'UPDATE PASSWORD'}</button>
            </form>
        </main>
    );
};

export default ResetPassword;
