import { useEffect } from 'react';
import { Link } from 'react-router';

const NotFound = () => {
    useEffect(() => { document.title = 'Page not found | SNITCH.'; }, []);

    return (
        <main className="page-shell page-shell--center">
            <p className="page-shell__eyebrow">ERROR 404</p>
            <h1 className="page-shell__title">Off the rack.</h1>
            <p className="page-shell__note">This page doesn't exist or has been moved.</p>
            <Link to="/" className="btn-solid">BACK TO SHOP</Link>
        </main>
    );
};

export default NotFound;
