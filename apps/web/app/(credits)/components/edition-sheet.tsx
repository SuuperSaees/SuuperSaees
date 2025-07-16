import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@kit/ui/sheet";
import { CreditOperations } from "~/lib/credit.types";
import EditCreditOperationsForm from "./form/edit-credit-operations";
import { Trans } from "@kit/ui/trans";
import { PencilIcon } from "lucide-react";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { Separator } from "@kit/ui/separator";

interface CreditEditionSheetProps {
  mode: "edit" | "create";
  creditId: string;
  clientOrganizationId: string;
  agencyId: string;
  userId: string;
  initialData?: CreditOperations.Response;
  buttonTrigger?: React.ReactNode;
}

const CreditEditionSheet = ({
  mode,
  initialData,
  creditId,
  clientOrganizationId,
  agencyId,
  userId,
  buttonTrigger,
}: CreditEditionSheetProps) => {
  return (
    <Sheet>
      {buttonTrigger != null ? (
        <SheetTrigger asChild>{buttonTrigger}</SheetTrigger>
      ) : (
        <SheetTrigger>
          <ThemedButton variant="outline">
            <PencilIcon className="w-4 h-4" />
          </ThemedButton>
        </SheetTrigger>
      )}

      <SheetContent className="flex flex-col gap-4">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <PencilIcon className="w-4 h-4" />
            <Trans i18nKey={`credits:form.${mode}.title`} />
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            <Trans i18nKey={`credits:form.${mode}.description`} />
          </SheetDescription>
        </SheetHeader>
        <Separator />
        <EditCreditOperationsForm
          mode={mode}
          initialData={initialData}
          creditId={creditId}
          clientOrganizationId={clientOrganizationId}
          agencyId={agencyId}
          userId={userId}
        />
      </SheetContent>
    </Sheet>
  );
};

export default CreditEditionSheet;
