import { useEffect, useState } from 'react';
import { addAddress, deleteAddress, getAddresses, updateAddress } from '../service/address.api';
import { INDIAN_STATES } from '../../Shared/utils/constants';

const emptyForm = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false };

/**
 * Lists saved addresses and lets the user add / edit / delete them.
 * With `selectable`, each card can be picked (used at checkout).
 */
const AddressBook = ({ selectable = false, selectedId = null, onSelect, onLoaded }) => {
    const [ addresses, setAddresses ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ form, setForm ] = useState(null);
    const [ editingId, setEditingId ] = useState(null);
    const [ error, setError ] = useState('');
    const [ saving, setSaving ] = useState(false);

    useEffect(() => {
        getAddresses()
            .then(data => {
                setAddresses(data.addresses);
                onLoaded?.(data.addresses);
            })
            .catch(() => setError('Could not load your addresses.'))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const apply = list => {
        setAddresses(list);
        onLoaded?.(list);
    };

    const openForm = address => {
        setError('');
        setEditingId(address?._id || null);
        setForm(address ? { ...emptyForm, ...address } : { ...emptyForm, isDefault: addresses.length === 0 });
    };

    const change = event => {
        const { name, value, type, checked } = event.target;
        setForm(current => ({ ...current, [ name ]: type === 'checkbox' ? checked : value }));
    };

    const submit = async event => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            const data = editingId ? await updateAddress(editingId, form) : await addAddress(form);
            apply(data.addresses);
            setForm(null);

            if (selectable && !editingId) onSelect?.(data.addresses[ data.addresses.length - 1 ]._id);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not save this address.');
        } finally {
            setSaving(false);
        }
    };

    const remove = async id => {
        try {
            const data = await deleteAddress(id);
            apply(data.addresses);
            if (selectedId === id) onSelect?.(data.addresses.find(item => item.isDefault)?._id || null);
        } catch {
            setError('Could not remove this address.');
        }
    };

    const makeDefault = async id => {
        const data = await updateAddress(id, { isDefault: true });
        apply(data.addresses);
    };

    if (loading) return <p className="page-shell__note">LOADING ADDRESSES...</p>;

    return (
        <div className="address-book">
            {addresses.length === 0 && !form && <p className="page-shell__note">No saved addresses yet.</p>}

            <div className="address-list">
                {addresses.map(address => (
                    <div
                        key={address._id}
                        className={`address-card ${selectable && selectedId === address._id ? 'is-selected' : ''}`}
                    >
                        {selectable && (
                            <label className="address-card__pick">
                                <input
                                    type="radio"
                                    name="delivery-address"
                                    checked={selectedId === address._id}
                                    onChange={() => onSelect?.(address._id)}
                                />
                                <span className="sr-only">Deliver to {address.name}</span>
                            </label>
                        )}
                        <div className="address-card__body">
                            <strong>{address.name} {address.isDefault && <em>DEFAULT</em>}</strong>
                            <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                            <p>{address.city}, {address.state} {address.pincode}</p>
                            <p>Phone: {address.phone}</p>
                            <div className="address-card__actions">
                                <button type="button" onClick={() => openForm(address)}>EDIT</button>
                                <button type="button" onClick={() => remove(address._id)}>REMOVE</button>
                                {!address.isDefault && <button type="button" onClick={() => makeDefault(address._id)}>MAKE DEFAULT</button>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {form ? (
                <form className="address-form" onSubmit={submit}>
                    <h3>{editingId ? 'Edit address' : 'New address'}</h3>
                    <div className="address-form__grid">
                        <label>Full name<input name="name" value={form.name} onChange={change} required minLength="2" autoComplete="name" /></label>
                        <label>Phone<input name="phone" value={form.phone} onChange={change} required pattern="[0-9]{10}" maxLength="10" inputMode="numeric" autoComplete="tel" /></label>
                        <label className="span-2">Address line 1<input name="line1" value={form.line1} onChange={change} required autoComplete="address-line1" /></label>
                        <label className="span-2">Address line 2 (optional)<input name="line2" value={form.line2} onChange={change} autoComplete="address-line2" /></label>
                        <label>City<input name="city" value={form.city} onChange={change} required autoComplete="address-level2" /></label>
                        <label>State
                            <select name="state" value={form.state} onChange={change} required>
                                <option value="">Select state</option>
                                {INDIAN_STATES.map(state => <option key={state} value={state}>{state}</option>)}
                            </select>
                        </label>
                        <label>Pincode<input name="pincode" value={form.pincode} onChange={change} required pattern="[0-9]{6}" maxLength="6" inputMode="numeric" autoComplete="postal-code" /></label>
                        <label className="address-form__default">
                            <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={change} /> Make this my default address
                        </label>
                    </div>
                    {error && <p className="account-form__error" role="alert">{error}</p>}
                    <div className="reviews__actions">
                        <button type="submit" className="btn-solid" disabled={saving}>{saving ? 'SAVING...' : 'SAVE ADDRESS'}</button>
                        <button type="button" className="btn-ghost" onClick={() => setForm(null)}>CANCEL</button>
                    </div>
                </form>
            ) : (
                <>
                    {error && <p className="account-form__error" role="alert">{error}</p>}
                    <button type="button" className="btn-ghost" onClick={() => openForm(null)}>+ ADD NEW ADDRESS</button>
                </>
            )}
        </div>
    );
};

export default AddressBook;
