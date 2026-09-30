import { useEffect, useState } from 'react';
import { createCoupon, deleteCoupon, getCoupons, toggleCoupon } from '../service/seller.api';
import SellerTabs from '../components/SellerTabs';
import { usePageMeta } from '../../Shared/hooks/usePageMeta';
import { useToast } from '../../Shared/hooks/useToast';
import { formatDate, formatPrice } from '../../Shared/utils/format';

const empty = { code: '', description: '', type: 'percent', value: '', minOrder: '', maxDiscount: '', usageLimit: '', expiresAt: '' };

const SellerCoupons = () => {
    usePageMeta({ title: 'Coupons' });
    const { toast } = useToast();
    const [ coupons, setCoupons ] = useState([]);
    const [ form, setForm ] = useState(empty);
    const [ saving, setSaving ] = useState(false);
    const [ error, setError ] = useState('');

    const load = () => getCoupons().then(data => setCoupons(data.coupons));

    useEffect(() => {
        load().catch(() => toast('Could not load coupons', 'error'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const change = event => setForm(current => ({ ...current, [ event.target.name ]: event.target.value }));

    const submit = async event => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            await createCoupon(form);
            setForm(empty);
            toast('Coupon created', 'success');
            await load();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not create the coupon.');
        } finally {
            setSaving(false);
        }
    };

    const toggle = async id => { await toggleCoupon(id); await load(); };

    const remove = async id => {
        await deleteCoupon(id);
        toast('Coupon deleted');
        await load();
    };

    return (
        <main className="page-shell">
            <p className="page-shell__eyebrow">SELLER</p>
            <h1 className="page-shell__title">Coupons</h1>
            <SellerTabs />

            <form className="address-form" onSubmit={submit}>
                <h3>New coupon</h3>
                <div className="address-form__grid">
                    <label>Code<input name="code" value={form.code} onChange={event => setForm(current => ({ ...current, code: event.target.value.toUpperCase() }))} required maxLength={20} placeholder="SUMMER10" /></label>
                    <label>Type
                        <select name="type" value={form.type} onChange={change}>
                            <option value="percent">Percent off</option>
                            <option value="flat">Flat amount off</option>
                        </select>
                    </label>
                    <label>{form.type === 'percent' ? 'Percent (1-90)' : 'Amount (₹)'}<input name="value" type="number" min="1" value={form.value} onChange={change} required /></label>
                    <label>Minimum order (₹)<input name="minOrder" type="number" min="0" value={form.minOrder} onChange={change} /></label>
                    {form.type === 'percent' && <label>Max discount (₹)<input name="maxDiscount" type="number" min="0" value={form.maxDiscount} onChange={change} /></label>}
                    <label>Usage limit<input name="usageLimit" type="number" min="0" value={form.usageLimit} onChange={change} placeholder="0 = unlimited" /></label>
                    <label>Expires on<input name="expiresAt" type="date" value={form.expiresAt} onChange={change} /></label>
                    <label className="span-2">Description<input name="description" value={form.description} onChange={change} placeholder="Shown to the customer" /></label>
                </div>
                {error && <p className="account-form__error" role="alert">{error}</p>}
                <button type="submit" className="btn-solid" disabled={saving}>{saving ? 'CREATING...' : 'CREATE COUPON'}</button>
            </form>

            <div className="order-list" style={{ marginTop: 28 }}>
                {coupons.length === 0 && <p className="page-shell__note">No coupons yet.</p>}
                {coupons.map(coupon => (
                    <article key={coupon._id} className="order-card order-card--static">
                        <div className="order-card__head">
                            <strong>{coupon.code}</strong>
                            <span>{coupon.type === 'percent' ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`}</span>
                            <span className={`status-badge status-badge--${coupon.active ? 'delivered' : 'cancelled'}`}>{coupon.active ? 'Active' : 'Paused'}</span>
                        </div>
                        <p className="order-card__names">
                            {coupon.minOrder > 0 && `Min order ${formatPrice(coupon.minOrder)} · `}
                            {coupon.maxDiscount > 0 && `Max ${formatPrice(coupon.maxDiscount)} · `}
                            Used {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''} times
                            {coupon.expiresAt && ` · Expires ${formatDate(coupon.expiresAt)}`}
                            {coupon.description && ` · ${coupon.description}`}
                        </p>
                        <div className="seller-actions">
                            <button type="button" onClick={() => toggle(coupon._id)}>{coupon.active ? 'Pause' : 'Activate'}</button>
                            <button type="button" className="is-danger" onClick={() => remove(coupon._id)}>Delete</button>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
};

export default SellerCoupons;
