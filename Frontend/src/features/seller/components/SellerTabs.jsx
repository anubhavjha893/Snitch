import { NavLink } from 'react-router';

const tabs = [
    { to: '/seller/dashboard', label: 'Products' },
    { to: '/seller/orders', label: 'Orders' },
    { to: '/seller/analytics', label: 'Analytics' },
    { to: '/seller/coupons', label: 'Coupons' },
];

const SellerTabs = () => (
    <nav className="seller-tabs" aria-label="Seller sections">
        {tabs.map(tab => <NavLink key={tab.to} to={tab.to}>{tab.label}</NavLink>)}
    </nav>
);

export default SellerTabs;
