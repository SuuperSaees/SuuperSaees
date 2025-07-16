import { Trans } from "@kit/ui/trans";
import { PlusIcon } from "lucide-react";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";

const AddButton = () => {
  return (
      <ThemedButton className="h-fit">
        <PlusIcon className="h-4 w-4" />
        <Trans i18nKey="credits:table.addButton" />
      </ThemedButton>
  );
};

export default AddButton;