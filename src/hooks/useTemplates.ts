
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi } from '@/services/api';
import { toast } from 'sonner';

export interface Template {
  _id: string;
  name: string;
  body: string;
  variables: Array<{
    name: string;
    type: 'text' | 'number' | 'date';
    required: boolean;
  }>;
  category: 'MARKETING' | 'TRANSACTIONAL' | 'UTILITY';
  language: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  whatsappTemplateName?: string; // WhatsApp template name for structured templates
  whatsappConfig?: {
    language: string;
    hasButtons: boolean;
    buttons?: Array<{
      type: string;
      title: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  name: string;
  body: string;
  variables: Array<{
    name: string;
    type: 'text' | 'number' | 'date';
    required: boolean;
  }>;
  category: 'MARKETING' | 'TRANSACTIONAL' | 'UTILITY';
  language: string;
}

interface UseTemplatesParams {
  status?: string;
  category?: string;
}

export const useTemplates = (params?: UseTemplatesParams) => {
  const queryClient = useQueryClient();

  const {
    data: templatesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['templates', params],
    queryFn: () => templateApi.getAll(params),
    select: (response) => response.data,
  });

  const createTemplate = useMutation({
    mutationFn: (data: CreateTemplateData) => templateApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating template:', error);
      toast.error(error.response?.data?.error || 'Failed to create template');
    },
  });

  const updateTemplate = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTemplateData> }) =>
      templateApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating template:', error);
      toast.error(error.response?.data?.error || 'Failed to update template');
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => templateApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting template:', error);
      toast.error(error.response?.data?.error || 'Failed to delete template');
    },
  });

  return {
    templates: templatesData || [],
    isLoading,
    error,
    createTemplate: createTemplate.mutate,
    updateTemplate: updateTemplate.mutate,
    deleteTemplate: deleteTemplate.mutate,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending,
  };
};
