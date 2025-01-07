import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Tags } from '~/lib/tags.types';
import { createTag, deleteTag, updateTag } from '~/server/actions/tags/tags.action';

interface UseTagMutationsProps {
    organizationId: string;
    orderId?: number;
    setSelectedTags: React.Dispatch<React.SetStateAction<Tags.Type[]>>;
    setSearchTagOptionsFiltered: React.Dispatch<React.SetStateAction<Tags.Type[]>>;
}

export const useTagMutations = ({
    orderId,
    setSelectedTags,
    setSearchTagOptionsFiltered
}: UseTagMutationsProps) => {
    const router = useRouter();
    const { t } = useTranslation(['orders', 'responses']);

    const createTagMutation = useMutation({
        mutationFn: async ({ payload }: { payload: Tags.Insert }) => {
            const newTag = await createTag(payload, orderId);
            setSearchTagOptionsFiltered(prev => [...prev, newTag]);
            setSelectedTags(prev => [...prev, newTag]);
            return newTag;
        },
        onSuccess: () => {
            toast.success(t('success.toastSuccess'), {
                description: t('success.orders.orderTagCreated'),
            });
            router.refresh();
        },
        onError: () => {
            toast.error(t('error.toastError'), { 
                description: t('error.orders.failedToCreateOrderTag') 
            });
        },
    });

    const updateTagMutation = useMutation({
        mutationFn: async (updatedTag: { id: string; name: string; color: string }) => {
            setSelectedTags(prev => 
                prev.map(tag => tag.id === updatedTag.id ? { ...tag, ...updatedTag } : tag)
            );
            setSearchTagOptionsFiltered(prev => 
                prev.map(tag => tag.id === updatedTag.id ? { ...tag, ...updatedTag } : tag)
            );
            return await updateTag(updatedTag);
        },
        onSuccess: () => {
            // toast.success(t('success.toastSuccess'), {
            //     description: t('success.orders.orderTagUpdated'),
            // });
            router.refresh();
        },
        onError: () => {
            toast.error(t('error.toastError'), { 
                description: t('error.orders.failedToUpdateOrderTag') 
            });
        },
    });

    const deleteTagMutation = useMutation({
        mutationFn: async (tagId: string) => {
            setSearchTagOptionsFiltered(prev => prev.filter(tag => tag.id !== tagId));
            setSelectedTags(prev => prev.filter(tag => tag.id !== tagId));
            return await deleteTag(tagId);
        },
        onSuccess: () => {
            toast.success(t('success.toastSuccess'), {
                description: t('success.orders.orderTagDeleted'),
            });
            router.refresh();
        },
        onError: () => {
            toast.error(t('error.toastError'), { 
                description: t('error.orders.failedToDeleteOrderTag') 
            });
        },
    });

    return {
        createTag: createTagMutation.mutate,
        updateTag: updateTagMutation.mutate,
        deleteTag: deleteTagMutation.mutate,
        isLoading: createTagMutation.isPending || 
                  updateTagMutation.isPending || 
                  deleteTagMutation.isPending
    };
};