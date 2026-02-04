import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 'lg' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const maxWidthClasses = {
        'sm': 'sm:max-w-sm',
        'md': 'sm:max-w-md',
        'lg': 'sm:max-w-lg',
        'xl': 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
        '5xl': 'sm:max-w-5xl',
        '6xl': 'sm:max-w-6xl',
        'full': 'sm:max-w-full'
    };

    const widthClass = maxWidthClasses[maxWidth] || maxWidthClasses['lg'];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 py-6 text-center sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-slate-900/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Vertical centering spacer */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${widthClass} w-full`}>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 uppercase font-outfit">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-2 normal-case font-inter">{children}</div>
                    </div>
                    {footer && (
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 border-t border-slate-100">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;
