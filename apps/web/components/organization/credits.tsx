"use client";

import { useQuery } from "@tanstack/react-query";
import CreditOperationsTable from "~/(credits)/components/operations-table";
import CreditStats from "~/(credits)/components/stats";
import TableSkeleton from "~/(views)/components/table/table-skeleton";
import { Credit } from "~/lib/credit.types";
import { getCredit, getCredits } from "~/server/actions/credits/credits.action";
import { SkeletonBox, SkeletonCards } from "../ui/skeleton";

function CreditsSection({
  clientOrganizationId,
  agencyId,
}: {
  clientOrganizationId: string;
  agencyId: string;
}) {
  const queryKey = ["organization-credits", clientOrganizationId];

  const creditQuery = useQuery({
    queryKey: ["organization-credit", clientOrganizationId],
    queryFn: async () => await getCredit(clientOrganizationId),
    enabled: !!clientOrganizationId,
    retry: 1,
  });

  const queryFn = async () =>
    await getCredits({
      pagination: {
        limit: 100,
        page: 1,
      },
      filters: {
        client_organization_id: [clientOrganizationId],
      },
    });

  const creditsQuery = useQuery({
    queryKey,
    queryFn,
    enabled: !!clientOrganizationId,
    retry: 1,
  });

  const getCreditValues = (credit: Credit.Response | undefined) => {
    const usedCredits = credit?.consumed ?? 0;
    const purchasedCredits = credit?.purchased ?? 0;
    const expiredCredits = credit?.expired ?? 0;

    const availableCredits = credit?.balance ?? 0;
    return { availableCredits, usedCredits, purchasedCredits, expiredCredits };
  };

  const { availableCredits, usedCredits, purchasedCredits, expiredCredits } =
    getCreditValues(creditQuery.data);

  const creditId = creditQuery.data?.id ?? "";

  return (
    <div className="flex flex-col gap-6">
      {creditQuery.isLoading ? (
        <SkeletonCards count={4} className="flex flex-wrap gap-6 w-full">
          <SkeletonBox className="min-w-72 flex-1 min-h-[110px]" />
        </SkeletonCards>
      ) : (
        <CreditStats
          availableCredits={availableCredits}
          usedCredits={usedCredits}
          purchasedCredits={purchasedCredits}
          expiredCredits={expiredCredits}
        />
      )}
      {creditQuery.isLoading ? (
        <TableSkeleton columns={6} rows={7} />
      ) : (
        <CreditOperationsTable
          initialData={creditsQuery.data}
          queryKey={queryKey}
          queryFn={queryFn}
          creditId={creditId}
          clientOrganizationId={clientOrganizationId}
          agencyId={agencyId}
        />
      )}
    </div>
  );
}

export default CreditsSection;
