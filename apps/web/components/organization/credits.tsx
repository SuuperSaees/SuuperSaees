"use client";

import { useQuery } from "@tanstack/react-query";
import CreditOperationsTable from "~/(credits)/components/operations-table";
import CreditStats from "~/(credits)/components/stats";
import TableSkeleton from "~/(views)/components/table/table-skeleton";
import { CreditOperations } from "~/lib/credit.types";
import { getCredits } from "~/server/actions/credits/credits.action";

function CreditsSection({
  clientOrganizationId,
}: {
  clientOrganizationId: string;
}) {
  const queryKey = ["organization-credits", clientOrganizationId];

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

  const invoicesQuery = useQuery({
    queryKey,
    queryFn,
    enabled: !!clientOrganizationId,
    retry: 1,
  });

  const getCreditValues = (credits: CreditOperations.Response[]) => {
    const usedCredits = credits
      .filter(
        (credit) => credit.status === CreditOperations.Enums.Status.CONSUMED,
      )
      .reduce((acc, credit) => acc + credit.quantity, 0);
    const purchasedCredits = credits
      .filter(
        (credit) => credit.status === CreditOperations.Enums.Status.PURCHASED,
      )
      .reduce((acc, credit) => acc + credit.quantity, 0);
    const expiredCredits = credits
      .filter(
        (credit) => credit.status === CreditOperations.Enums.Status.EXPIRED,
      )
      .reduce((acc, credit) => acc + credit.quantity, 0);

    const availableCredits = credits.length - usedCredits - expiredCredits;
    return { availableCredits, usedCredits, purchasedCredits, expiredCredits };
  };

  const { availableCredits, usedCredits, purchasedCredits, expiredCredits } =
    getCreditValues(invoicesQuery.data?.data ?? []);

  if (invoicesQuery.isLoading) return <TableSkeleton columns={6} rows={7} />;

  return (
    <div className="flex flex-col gap-6">
      <CreditStats
        availableCredits={availableCredits}
        usedCredits={usedCredits}
        purchasedCredits={purchasedCredits}
        expiredCredits={expiredCredits}
      />
      <CreditOperationsTable
        initialData={invoicesQuery.data}
        queryKey={queryKey}
        queryFn={queryFn}
      />
    </div>
  );
}

export default CreditsSection;
