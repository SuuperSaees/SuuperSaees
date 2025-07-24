import { Sheet, SheetContent, SheetTrigger } from "@kit/ui/sheet";
import AsideOrderInformation from "./aside-order-information";
import { ChevronLeft } from "lucide-react";
import { Tags } from "~/lib/tags.types";
import { AgencyStatus } from "~/lib/agency-statuses.types";
import { cn } from "@kit/ui/utils";

interface OrderInformationSheetProps {
  orderAgencyTags: Tags.Type[];
  agencyStatuses: AgencyStatus.Type[];
  agencyTags: Tags.Type[];
}
const OrderInformationSheet = ({
  orderAgencyTags,
  agencyStatuses,
  agencyTags,
}: OrderInformationSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger
        className={cn(
          "fixed top-1/2 right-[-20px] -translate-y-1/2 z-50",
          "w-10 h-14 flex items-center justify-center",
          "bg-black/70 text-white",
          "rounded-full transition-transform duration-200 hover:scale-110 active:scale-95",
        )}
      >
        <ChevronLeft className="w-6 h-6 " />
      </SheetTrigger>
      <SheetContent className="h-full p-0">
        <AsideOrderInformation
          orderAgencyTags={orderAgencyTags}
          agencyStatuses={agencyStatuses}
          agencyTags={agencyTags}
        />
      </SheetContent>
    </Sheet>
  );
};

export default OrderInformationSheet;
