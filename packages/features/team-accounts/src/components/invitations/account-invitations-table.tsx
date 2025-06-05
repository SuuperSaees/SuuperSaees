"use client";

import { useMemo, useState } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@kit/ui/badge";
import { Button } from "@kit/ui/button";
import { DataTable } from "@kit/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kit/ui/dropdown-menu";
import { If } from "@kit/ui/if";
import { Input } from "@kit/ui/input";
import { ProfileAvatar } from "@kit/ui/profile-avatar";
import { Trans } from "@kit/ui/trans";

import { RoleBadge } from "../members/role-badge";
import { DeleteInvitationDialog } from "./delete-invitation-dialog";
import { RenewInvitationDialog } from "./renew-invitation-dialog";
import { UpdateInvitationDialog } from "./update-invitation-dialog";
import { Pagination } from "../../../../../../apps/web/lib/pagination";
import { useDataPagination } from "../../../../../../apps/web/app/hooks/use-data-pagination";
import {
  Invitation,
  loadPaginatedInvitations,
} from "../../../../../../apps/web/app/(main)/team/_lib/server/members-page.loader";
import { useTableConfigs } from "../../../../../../apps/web/app/(views)/hooks/use-table-configs";

type AccountInvitationsTableProps = {
  initialData: Pagination.Response<Invitation>;
  organizationId: string;

  permissions: {
    canUpdateInvitation: boolean;
    canRemoveInvitation: boolean;
    currentUserRoleHierarchy: number;
  };
};

export function AccountInvitationsTable({
  organizationId,
  initialData,
  permissions,
}: AccountInvitationsTableProps) {
  const { t } = useTranslation("team");
  const [search, setSearch] = useState("");
  const columns = useGetColumns(permissions);

  const { config } = useTableConfigs("table-config");

  const {
    data: invitations,
    isLoading: invitationsAreLoading,
    pagination,
  } = useDataPagination<Invitation>({
    queryKey: ["invitations"],
    queryFn: ({ page, limit, filters }) =>
      loadPaginatedInvitations(organizationId, {
        pagination: { page, limit },
        filters: filters?.searchTerm
          ? [
              {
                field: "email",
                operator: "ilike",
                value: filters.searchTerm,
              },
            ]
          : undefined,
      }),
    initialData,
    config: {
      limit: config.rowsPerPage.value,
      filters: { searchTerm: search },
    },
  });

  const filteredInvitations = invitations as Invitation[];

  const sortedInvitations = useMemo(() => {
    return [...filteredInvitations].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [filteredInvitations]);

  const extendedConfig = {
    ...config,
    pagination: {
      totalCount: pagination.total,
      totalPages: pagination.totalPages,
      currentPage: pagination.currentPage,
      hasNextPage: pagination.hasNextPage,
      isOffsetBased: true,
      goToPage: pagination.goToPage,
      isLoadingMore: invitationsAreLoading,
    },
  };

  return (
    <div className={"flex flex-col space-y-5 pt-12"}>
      <div className="flex items-center justify-between">
        <h3 className="font-inter text-xl font-medium leading-4">
          <Trans i18nKey={"team:pendingInvitesHeading"} />
        </h3>
        <div className="relative flex-1 md:grow-0">
          <Search className="bg-white text-muted-foreground absolute right-2.5 top-2.5 h-4 w-4" />
          <Input
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            placeholder={t(`searchInvitations`)}
            className="bg-background w-full rounded-lg pr-8 md:w-[200px] lg:w-[320px]"
          />
        </div>
      </div>

      <div className="bg-white rounded-md">
        <DataTable
          data-cy={"invitations-table"}
          columns={columns}
          data={sortedInvitations}
          configs={extendedConfig}
        />
      </div>
    </div>
  );
}

function useGetColumns(permissions: {
  canUpdateInvitation: boolean;
  canRemoveInvitation: boolean;
  currentUserRoleHierarchy: number;
}): ColumnDef<Invitation>[] {
  const { t } = useTranslation("team");

  return useMemo(
    () => [
      {
        header: t("emailLabel"),
        size: 200,
        cell: ({ row }) => {
          const member = row.original;
          const email = member.email;

          return (
            <span
              data-test={"invitation-email"}
              className={"flex items-center space-x-4 text-left"}
            >
              <span>
                <ProfileAvatar text={email} />
              </span>

              <span>{email}</span>
            </span>
          );
        },
      },
      {
        header: t("roleLabel"),
        cell: ({ row }) => {
          const { role } = row.original;

          return <RoleBadge role={role} />;
        },
      },
      {
        header: t("invitedAtLabel"),
        id: "created_at",
        sortingFn: "datetime",
        sortDescFirst: true,
        cell: ({ row }) => {
          return new Date(row.original.created_at).toLocaleDateString();
        },
      },
      {
        header: t("expiresAtLabel"),
        cell: ({ row }) => {
          return new Date(row.original.expires_at).toLocaleDateString();
        },
      },
      {
        header: t("inviteStatus"),
        cell: ({ row }) => {
          const isExpired = getIsInviteExpired(row.original.expires_at);

          if (isExpired) {
            return <Badge variant={"warning"}>{t("expired")}</Badge>;
          }

          return <Badge variant={"success"}>{t("active")}</Badge>;
        },
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <ActionsDropdown
            permissions={permissions}
            invitation={row.original}
          />
        ),
      },
    ],
    [permissions, t],
  );
}

function ActionsDropdown({
  permissions,
  invitation,
}: {
  permissions: AccountInvitationsTableProps["permissions"];
  invitation: Invitation;
}) {
  const [isDeletingInvite, setIsDeletingInvite] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isRenewingInvite, setIsRenewingInvite] = useState(false);

  if (!permissions.canUpdateInvitation && !permissions.canRemoveInvitation) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"} size={"icon"}>
            <MoreVertical className={"h-4 w-4 text-gray-400"} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <If condition={permissions.canUpdateInvitation}>
            <DropdownMenuItem
              data-test={"update-invitation-trigger"}
              onClick={() => setIsUpdatingRole(true)}
            >
              <Trans i18nKey={"team:updateInvitation"} />
            </DropdownMenuItem>

            <If condition={getIsInviteExpired(invitation.expires_at)}>
              <DropdownMenuItem
                data-test={"renew-invitation-trigger"}
                onClick={() => setIsRenewingInvite(true)}
              >
                <Trans i18nKey={"team:renewInvitation"} />
              </DropdownMenuItem>
            </If>
          </If>

          <If condition={permissions.canRemoveInvitation}>
            <DropdownMenuItem
              data-test={"remove-invitation-trigger"}
              onClick={() => setIsDeletingInvite(true)}
            >
              <Trans i18nKey={"team:removeInvitation"} />
            </DropdownMenuItem>
          </If>
        </DropdownMenuContent>
      </DropdownMenu>

      <If condition={isDeletingInvite}>
        <DeleteInvitationDialog
          isOpen
          setIsOpen={setIsDeletingInvite}
          invitationId={invitation.id}
          queryKey={"invitations"}
        />
      </If>

      <If condition={isUpdatingRole}>
        <UpdateInvitationDialog
          isOpen
          setIsOpen={setIsUpdatingRole}
          invitationId={invitation.id}
          userRole={invitation.role}
          userRoleHierarchy={permissions.currentUserRoleHierarchy}
          queryKey={"invitations"}
        />
      </If>

      <If condition={isRenewingInvite}>
        <RenewInvitationDialog
          isOpen
          setIsOpen={setIsRenewingInvite}
          invitationId={invitation.id}
          email={invitation.email}
          queryKey={"invitations"}
        />
      </If>
    </>
  );
}

function getIsInviteExpired(isoExpiresAt: string) {
  const currentIsoTime = new Date().toISOString();

  const isoExpiresAtDate = new Date(isoExpiresAt);
  const currentIsoTimeDate = new Date(currentIsoTime);

  return isoExpiresAtDate < currentIsoTimeDate;
}
