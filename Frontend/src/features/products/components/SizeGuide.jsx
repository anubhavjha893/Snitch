import { useEffect } from 'react';

// measurements in inches, for shirts
const rows = [
    { size: 'S', chest: '38', length: '27', shoulder: '17' },
    { size: 'M', chest: '40', length: '28', shoulder: '17.5' },
    { size: 'L', chest: '42', length: '29', shoulder: '18' },
    { size: 'XL', chest: '44', length: '30', shoulder: '18.5' },
    { size: 'XXL', chest: '46', length: '31', shoulder: '19' },
];

const SizeGuide = ({ onClose }) => {
    useEffect(() => {
        const onKey = event => { if (event.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [ onClose ]);

    return (
        <div className="seller-modal" role="dialog" aria-modal="true" aria-label="Size guide" onClick={onClose}>
            <div onClick={event => event.stopPropagation()}>
                <h2>Size guide</h2>
                <p style={{ margin: 0, fontSize: 12 }}>Body measurements in inches. Oversized fits are cut roomier, so size down if you want a regular look.</p>
                <div className="size-table-wrap">
                    <table className="size-table">
                        <thead>
                            <tr><th>Size</th><th>Chest</th><th>Length</th><th>Shoulder</th></tr>
                        </thead>
                        <tbody>
                            {rows.map(row => (
                                <tr key={row.size}><td>{row.size}</td><td>{row.chest}</td><td>{row.length}</td><td>{row.shoulder}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="seller-actions">
                    <button type="button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default SizeGuide;
