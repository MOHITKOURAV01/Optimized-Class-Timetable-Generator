import React from 'react';
import { useNotificationStore } from '../../store/notification.store';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ notification }) => {
    const { removeNotification } = useNotificationStore();
    const { id, message, type } = notification;

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
    };

    const styles = {
        success: 'border-green-100 bg-green-50 shadow-green-100/50',
        error: 'border-red-100 bg-red-50 shadow-red-100/50',
        info: 'border-blue-100 bg-blue-50 shadow-blue-100/50',
        warning: 'border-amber-100 bg-amber-50 shadow-amber-100/50'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl ${styles[type]} pointer-events-auto min-w-[300px] max-w-md mb-3`}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="flex-grow">
                <p className="text-sm font-bold text-slate-800">{message}</p>
            </div>
            <button
                onClick={() => removeNotification(id)}
                className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 transition-colors text-slate-400 hover:text-slate-600"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export const ToastContainer = () => {
    const { notifications } = useNotificationStore();

    return (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none flex flex-col items-end">
            <AnimatePresence>
                {notifications.map((n) => (
                    <Toast key={n.id} notification={n} />
                ))}
            </AnimatePresence>
        </div>
    );
};
