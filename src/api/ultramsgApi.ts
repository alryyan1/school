import client from '@/axios-client';

export interface BulkSendTextPayload {
  recipients: string[];
  body: string;
  start_delay_seconds?: number;
}

export interface BulkSendStatus {
  id: number;
  message: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    percentage: number;
  };
  timing: {
    started_at: string;
    completed_at: string | null;
    next_scheduled_at: string | null;
    time_until_next_seconds: number | null;
  };
  messages: Array<{
    id: number;
    recipient: string;
    sequence_order: number;
    status: 'pending' | 'sent' | 'failed';
    scheduled_at: string;
    sent_at: string | null;
    error_message: string | null;
    ultramsg_id: string | null;
  }>;
}

export const ultramsgApi = {
  bulkSendText: (payload: BulkSendTextPayload) =>
    client.post('/whatsapp/bulk-send-text', payload).then((res) => res.data as { bulk_send_id: number; queued: number; interval_seconds: number }),
  
  getBulkSendStatus: (id: number) =>
    client.get(`/whatsapp/bulk-send-status/${id}`).then((res) => res.data as BulkSendStatus),
};


