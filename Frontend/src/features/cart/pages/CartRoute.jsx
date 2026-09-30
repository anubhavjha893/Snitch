import { useSelector } from 'react-redux';
import Cart from './Cart';
import GuestCart from './GuestCart';

// /cart is public: signed-in users get their server cart, guests get the on-device one
const CartRoute = () => {
    const user = useSelector(state => state.auth.user);
    const loading = useSelector(state => state.auth.loading);

    if (loading) return <main className="page-shell"><p className="page-shell__note">LOADING...</p></main>;

    return user ? <Cart /> : <GuestCart />;
};

export default CartRoute;
