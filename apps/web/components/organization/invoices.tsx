"use client";

import InvoicesTable from "../../app/(main)/invoices/components/table";
import { getInvoices } from "~/server/actions/invoices/invoices.action";
import { useQuery } from "@tanstack/react-query";
import TableSkeleton from "~/(views)/components/table/table-skeleton";

function InvoicesSection({
  clientOrganizationId,
}: {
  clientOrganizationId: string;
}) {
  const queryKey = ["organization-invoices", clientOrganizationId];
  const queryFn = async () =>
    await getInvoices({
      pagination: {
        limit: 100,
        page: 1,
      },
      filters: { client_organization_id: [clientOrganizationId ?? ""] },
    });
  const invoicesQuery = useQuery({
    queryKey,
    queryFn,
    enabled: !!clientOrganizationId,
  });

  if (invoicesQuery.isLoading) return <TableSkeleton columns={6} rows={7} />;
  if (!invoicesQuery.data) return null;

  return <InvoicesTable initialData={invoicesQuery.data} queryKey={queryKey} queryFn={queryFn} />;
}

export default InvoicesSection;
