import { Trans } from "@kit/ui/trans";
import { PlusIcon } from "lucide-react";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { ButtonProps } from "@kit/ui/button";
import { forwardRef } from "react";

const AddButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
      <ThemedButton className="h-fit" ref={ref} {...props}>
        <PlusIcon className="h-4 w-4" />
        <Trans i18nKey="credits:table.addButton" />
      </ThemedButton>
  );
});

AddButton.displayName = "AddButton";

export default AddButton;