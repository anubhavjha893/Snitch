import { Link } from 'react-router';

const Footer = () => (
    <footer className="site-footer">
        <div className="site-footer__grid">
            <div>
                <p className="site-footer__brand">SNITCH.</p>
                <p className="site-footer__tag">Wear your own rules. Shirts that do the talking before you do.</p>
            </div>
            <nav aria-label="Shop">
                <h4>SHOP</h4>
                <Link to="/">All shirts</Link>
                <Link to="/wishlist">Wishlist</Link>
                <Link to="/cart">Cart</Link>
            </nav>
            <nav aria-label="Account">
                <h4>ACCOUNT</h4>
                <Link to="/account">Profile</Link>
                <Link to="/orders">My orders</Link>
                <Link to="/login">Sign in</Link>
            </nav>
            <div>
                <h4>HELP</h4>
                <p>Free returns within 14 days.</p>
                <p>Secure payments via Razorpay.</p>
            </div>
        </div>
        <div className="site-footer__bottom">
            <span>© {new Date().getFullYear()} SNITCH. ALL RIGHTS RESERVED.</span>
            <span>MADE FOR THE WAY YOU MOVE.</span>
        </div>
    </footer>
);

export default Footer;
