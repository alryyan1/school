// src/api/notificationApi.ts (or add to feeInstallmentApi.ts)
import axiosClient from '../axios-client';

export const NotificationApi = {
    /**
     * Sends a WhatsApp reminder for a specific installment.
     */
    sendInstallmentReminder: (feeInstallmentId: number) => {
        const url = `/notify/whatsapp/installment/${feeInstallmentId}`;
        // No specific payload needed from frontend, just trigger the backend action
        return axiosClient.post(url); // Expects simple success/error message back
    }
};