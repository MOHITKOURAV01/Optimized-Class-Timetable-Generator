import React from 'react';
import { useNotificationStore } from '../../store/notification.store';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from './Button';

const ConfirmDialog = () => {
    const { confirmDialog, hideConfirm } = useNotificationStore();
    const { isOpen, title, message, onConfirm, onCancel, type } = confirmDialog;

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        hideConfirm();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
        hideConfirm();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 max-w-md w-full overflow-hidden"
                    >
                        {/* Status Icon Decoration */}
                        <div className="absolute top-0 right-0 p-12 -mr-16 -mt-16 bg-amber-50 rounded-full" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-amber-100 rounded-2xl">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{title}</h3>
                            </div>

                            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                {message}
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-2xl py-4 font-black text-sm uppercase tracking-widest"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className={`flex-1 rounded-2xl py-4 font-black text-sm uppercase tracking-widest shadow-lg ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                        }`}
                                    onClick={handleConfirm}
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>

                        <button
                            onClick={handleCancel}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
