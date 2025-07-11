import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '@/services/api';

export interface CampaignMessage {
  _id: string;
  campaignId: string;
  contactId: string;
  contact: {
    name: string;
    phone: string;
    email?: string;
  };
  templateId: string;
  messageContent: string;
  variables: Record<string, string>;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  whatsappMessageId?: string;
  errorMessage?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const useCampaignMessages = (campaignId?: string, params?: any) => {
  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['campaign-messages', campaignId, params],
    queryFn: () => campaignId ? campaignApi.getMessages(campaignId, params) : Promise.resolve({ data: [] }),
    enabled: !!campaignId,
  });

  return {
    messages: (messagesData?.data || []) as CampaignMessage[],
    isLoading,
    error,
  };
};