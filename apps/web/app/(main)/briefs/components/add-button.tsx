'use client'

import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";
import { useMutation } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { useTranslation } from "react-i18next";
import { handleResponse } from "~/lib/response/handle-response";
import { createBrief } from "~/team-accounts/src/server/actions/briefs/create/create-briefs";

const AddButton = () => {
  const router = useRouter();
  const { workspace: userWorkspace } = useUserWorkspace();
  const userRole = userWorkspace?.role ?? ''; 
  const canCreateBrief = userRole === 'agency_owner' || userRole === 'agency_project_manager'

  const briefMutation = useMutation({
    mutationFn: async () => {
      const res = await createBrief({});
      await handleResponse(res, 'briefs', t);
      if (res.ok && res?.success?.data) {
        router.push(`briefs/${res.success.data.id}`);
      }
    },
  });
  const { t } = useTranslation('briefs');

  if (!canCreateBrief) return null;
  return (
    <ThemedButton
      onClick={() => briefMutation.mutate()}
      disabled={briefMutation.isPending}
      className='w-fit'
      aria-label={t('briefs:createBrief')}
    >
      <PlusIcon className="h-4 w-4" />
      <span className="hidden md:inline">
        {t('briefs:createBrief')}
      </span>
    </ThemedButton>
  );
};

export default AddButton;
