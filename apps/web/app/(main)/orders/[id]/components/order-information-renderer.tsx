"use client";

import { Tags } from "~/lib/tags.types";
import { useActivityContext } from "../context/activity-context";
import dynamic from "next/dynamic";
import { AgencyStatus } from "~/lib/agency-statuses.types";
import { SkeletonBox } from "~/components/ui/skeleton";

// Dynamic imports for reducing bundle size (only load the component when it's needed)
const AsideOrderInformation = dynamic(
  () => import("./aside-order-information"),
  {
    loading: () => <OrderInformationSkeleton />,
  },
);
const OrderInformationSheet = dynamic(
  () => import("./order-information-sheet"),
  {
    loading: () => null,
  },
);

interface OrderInformationRendererProps {
  orderAgencyTags: Tags.Type[];
  agencyStatuses: AgencyStatus.Type[];
  agencyTags: Tags.Type[];
}

const OrderInformationRenderer = ({
  orderAgencyTags,
  agencyStatuses,
  agencyTags,
}: OrderInformationRendererProps) => {
  const { isMobile } = useActivityContext();

  if (isMobile)
    return (
      <OrderInformationSheet
        orderAgencyTags={orderAgencyTags}
        agencyStatuses={agencyStatuses}
        agencyTags={agencyTags}
      />
    );
  return (
    <AsideOrderInformation
      orderAgencyTags={orderAgencyTags}
      agencyStatuses={agencyStatuses}
      agencyTags={agencyTags}
    />
  );
};

const OrderInformationSkeleton = () => {
  return <SkeletonBox className="w-full h-full max-w-80 min" />;
};
export default OrderInformationRenderer;
