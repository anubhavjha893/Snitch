import { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext } from './toastContext';

export const ToastProvider = ({ children }) => {
    const [ toasts, setToasts ] = useState([]);
    const nextId = useRef(0);

    const dismiss = useCallback(id => setToasts(list => list.filter(item => item.id !== id)), []);

    const toast = useCallback((message, type = 'info') => {
        const id = nextId.current++;
        setToasts(list => [ ...list.slice(-3), { id, message, type } ]);
        setTimeout(() => dismiss(id), 3500);
    }, [ dismiss ]);

    const value = useMemo(() => ({ toast }), [ toast ]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-stack" role="status" aria-live="polite">
                {toasts.map(item => (
                    <button key={item.id} type="button" className={`toast toast--${item.type}`} onClick={() => dismiss(item.id)}>
                        {item.message}
                    </button>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
