import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
    notifications: [],

    // Toast notifications
    addNotification: (message, type = 'info', duration = 3000) => {
        const id = Date.now();
        set((state) => ({
            notifications: [...state.notifications, { id, message, type }]
        }));

        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((n) => n.id !== id)
            }));
        }, duration);
    },

    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id)
        }));
    },

    // Confirmation dialog state
    confirmDialog: {
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        onCancel: null,
        type: 'warning'
    },

    showConfirm: ({ title, message, onConfirm, onCancel, type = 'warning' }) => {
        set({
            confirmDialog: {
                isOpen: true,
                title,
                message,
                onConfirm,
                onCancel,
                type
            }
        });
    },

    hideConfirm: () => {
        set({
            confirmDialog: {
                isOpen: false,
                title: '',
                message: '',
                onConfirm: null,
                onCancel: null,
                type: 'warning'
            }
        });
    }
}));
