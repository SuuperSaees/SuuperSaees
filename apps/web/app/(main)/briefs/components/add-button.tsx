
import { UseMutationResult } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { useTranslation } from "react-i18next";

interface AddButtonProps {
  briefMutation: UseMutationResult<void, Error, void, unknown>
}
const AddButton = ({ briefMutation }: AddButtonProps) => {
  const { t } = useTranslation('briefs');
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
