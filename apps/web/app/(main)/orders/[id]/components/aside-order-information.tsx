"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarIcon, FlagIcon, Loader, Check, Copy } from "lucide-react";
import { getOrderAgencyMembers } from "node_modules/@kit/team-accounts/src/server/actions/orders/get/get-order";
import DatePicker from "node_modules/@kit/team-accounts/src/server/actions/orders/pick-date/pick-date";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { AgencyStatus } from "~/lib/agency-statuses.types";
import { Order } from "~/lib/order.types";
import { parseISO } from "date-fns";
import {
  updateOrder,
  updateOrderAssigns,
  updateOrderFollowers,
  logOrderActivities,
} from "../../../../../../../packages/features/team-accounts/src/server/actions/orders/update/update-order";
import { AgencyStatusesProvider } from "../../components/context/agency-statuses-context";
import { useActivityContext } from "../context/activity-context";
import ActivityAssignations from "./activity-assignations";
import ActivityFollowers from "./activity-followers";
import StatusCombobox from "./status-combobox";
import AvatarDisplayer from "./ui/avatar-displayer";
import { PriorityCombobox } from "./priority-combobox";
import { getClientMembersForOrganization } from "~/team-accounts/src/server/actions/clients/get/get-clients";
import { getFormattedDateRange } from "../utils/get-formatted-dates";
import { User } from "@supabase/supabase-js";
import {
  generateTokenId,
  createToken,
} from "~/server/actions/tokens/tokens.action";
import Link from "next/link";
import DeleteOrderDropdown from "./delete-order-dropdown";
import { Switch } from "@kit/ui/switch";
import Tooltip from "~/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@kit/ui/dialog";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { copyToClipboard } from "~/utils/clipboard";
import ActivityTags from "./activity-tags";
import { Tags } from "~/lib/tags.types";
import { updateOrderTags } from "~/server/actions/orders/orders.action";
import CreditsInput from "./credits-input";
import { useUserWorkspace } from "@kit/accounts/hooks/use-user-workspace";
interface AsideOrderInformationProps {
  className?: string;
  orderAgencyTags: Tags.Type[];
  [key: string]: unknown;
  agencyStatuses: AgencyStatus.Type[];
  agencyTags: Tags.Type[];
}
const AsideOrderInformation = ({
  // order,
  className,
  agencyStatuses,
  orderAgencyTags,
  agencyTags,
  ...rest
}: AsideOrderInformationProps) => {
  const { t, i18n } = useTranslation(["orders", "responses"]);
  const language = i18n.language;
  const router = useRouter();
  const { userRole, order, userWorkspace } = useActivityContext();
  const [isPublic, setIsPublic] = useState(order.visibility === "public");

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const baseUrl = window.location.origin;

  const { organization } = useUserWorkspace();
  const userId = userWorkspace?.id ?? "";

  const handleGenerateTokenId = async () => {
    const tokenId = await generateTokenId({ id: order.uuid });
    setTokenId(tokenId ?? "");
    await createToken(
      {
        id: order.uuid,
        account_id: order.agency_id,
        agency_id: order.agency_id,
        data: {
          order_id: order.id,
        },
      },
      tokenId,
    );
  };

  useEffect(() => {
    if (order.visibility === "public") {
      void handleGenerateTokenId();
    }
  }, []);

  const handleCopy = async () => {
    await copyToClipboard(
      `${baseUrl}/orders/${order.id}?public_token_id=${tokenId}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const changeVisibility = useMutation({
    mutationFn: async (visibility: Order.Type["visibility"]) => {
      setIsPublic(visibility === "public");
      if (visibility === "public") {
        setShowShareDialog(true);
      }
      await updateOrder(order.id, { visibility });
      order.visibility = visibility;
    },
    onSuccess: async () => {
      const tokenId = await generateTokenId({ id: order.uuid });
      setTokenId(tokenId ?? "");
      await createToken(
        {
          id: order.uuid,
          account_id: order.agency_id,
          agency_id: order.agency_id,
          data: {
            order_id: order.id,
          },
        },
        tokenId,
      );
    },
    onError: () => {
      toast.error("Error", {
        description: t("error.orders.failedToUpdateOrderVisibility"),
      });
    },
  });

  const changeDate = useMutation({
    mutationFn: async (due_date: Order.Type["due_date"]) => {
      const { order: updatedOrder, user } = await updateOrder(order.id, {
        due_date,
      });
      return { updatedOrder, user };
    },
    onSuccess: async ({
      updatedOrder,
      user,
    }: {
      updatedOrder: Order.Type;
      user: User | null | undefined;
    }) => {
      toast.success("Success", {
        description: t("success.orders.orderDateUpdated"),
      });
      const fields: (keyof Order.Update)[] = ["due_date"];
      await logOrderActivities(
        updatedOrder.id,
        updatedOrder,
        user?.id ?? "",
        user?.user_metadata?.name ?? user?.user_metadata?.email ?? "",
        undefined,
        fields,
      );
      router.push(`/orders/${order.id}`);
    },
    onError: () => {
      toast.error("Error", {
        description: t("error.orders.failedToUpdateOrderDate"),
      });
    },
  });

  const changeAgencyMembersAssigned = useMutation({
    mutationFn: (agencyMemberIds: string[]) => {
      return updateOrderAssigns(order.id, agencyMemberIds);
    },
    onSuccess: () => {
      toast.success("Success", {
        description: t("success.orders.orderAssigneesUpdated"),
      });
    },
    onError: () => {
      toast.error("Error", {
        description: t("error.orders.failedToUpdateOrderAssigneees"),
      });
    },
  });

  const changeAgencyMembersFollowers = useMutation({
    mutationFn: (agencyMemberIds: string[]) => {
      return updateOrderFollowers(order.id, agencyMemberIds);
    },
    onSuccess: () => {
      toast.success("Success", {
        description: t("success.orders.orderFollowersUpdated"),
      });
    },
    onError: () => {
      toast.error("Error", {
        description: t("error.orders.failedToUpdateOrderFollowers"),
      });
    },
  });

  const changeOrderTags = useMutation({
    mutationFn: (tagIds: string[]) => {
      return updateOrderTags(order.id, tagIds);
    },
    onSuccess: () => {
      toast.success(t("success.toastSuccess"), {
        description: t("success.orders.orderTagsUpdated"),
      });
    },
    onError: () => {
      toast.error(t("error.toastError"), {
        description: t("error.orders.failedToUpdateOrderTags"),
      });
    },
  });

  const { data: orderAgencyMembers, isLoading: isLoadingAssignees } = useQuery({
    queryKey: ["order-agency-members", order.id],
    queryFn: () => getOrderAgencyMembers(order.agency_id, order.id),
    retry: 5,
    enabled:
      userRole === "agency_owner" || userRole === "agency_project_manager",
  });

  const { data: orderAgencyClientsFollowers, isLoading: isLoadingFollowers } =
    useQuery({
      queryKey: ["order-agency-clients-followers", order.id],
      queryFn: () =>
        getClientMembersForOrganization(order.client_organization_id),
      retry: 5,
      enabled:
        userRole === "agency_owner" ||
        userRole === "agency_project_manager" ||
        userRole === "client_owner",
    });

  const searchUserOptions =
    orderAgencyMembers?.map((user) => ({
      picture_url: Array.isArray(user?.user_settings)
        ? (user?.user_settings[0]?.picture_url ?? user.picture_url ?? "")
        : (user?.user_settings?.picture_url ?? user.picture_url ?? ""),
      value: user.id,
      label: Array.isArray(user?.user_settings)
        ? (user?.user_settings[0]?.name ?? user.name ?? "")
        : (user?.user_settings?.name ?? user.name ?? ""),
    })) ?? [];

  const searchUserOptionsFollowers =
    orderAgencyClientsFollowers
      ?.filter((currentUser) => currentUser.role !== "client_guest")
      .map((user) => ({
        picture_url: Array.isArray(user?.settings)
          ? (user?.settings[0]?.picture_url ?? user?.picture_url)
          : (user?.settings?.picture_url ?? user?.picture_url),
        value: user.id,
        label: Array.isArray(user?.settings)
          ? (user?.settings[0]?.name ?? user.name ?? "")
          : (user?.settings?.name ?? user.name ?? ""),
        role: user.role,
      })) ?? [];

  const userRoles = new Set([
    "agency_member",
    "agency_owner",
    "agency_project_manager",
  ]);

  const userRolesFollowers = new Set(["client_owner", "client_member"]);

  const canAddAssignes = userRoles.has(userRole);
  const canAddFollowers =
    userRolesFollowers.has(userRole) || userRoles.has(userRole);

  const creditsEnabled = organization?.settings?.credits?.enable_credits;

  return (
    <AgencyStatusesProvider
      initialStatuses={agencyStatuses}
      initialTags={orderAgencyTags}
    >
      <div
        className={`no-scrollbar relative flex h-full min-h-full w-full min-w-0 max-w-80 shrink-0 flex-col gap-4 overflow-y-auto border-b-0 border-l border-r-0 border-t-0 border-gray-200  text-gray-700 ${className}
        [&>div]:px-4 first:[&>div]:py-[28px]`}
        {...rest}
      >
        <div className="border-b border-gray-200 flex flex-col gap-[8.5px]">
          <div className="flex items-start justify-between">
            <h3 className="font-inter text-xl font-medium leading-4">
              {t("details.createdBy")}
            </h3>

            {userRole !== "client_guest" && (
              <div className="flex items-center">
                {canAddAssignes && (
                  <Tooltip content={t("details.visibility")}>
                    <button
                      onClick={() => {
                        changeVisibility.mutate(
                          isPublic ? "private" : "public",
                        );
                      }}
                      className="h-fit"
                    >
                      <Switch checked={isPublic} />
                    </button>
                  </Tooltip>
                )}

                <DeleteOrderDropdown
                  orderId={order?.id}
                  isPublic={isPublic}
                  tokenId={tokenId ?? undefined}
                />
              </div>
            )}
          </div>

          {userRole === "client_owner" ||
          userRole === "client_member" ||
          userRole === "agency_owner" ||
          userRole === "agency_project_manager" ? (
            <Link
              href={`/clients/organizations/${order.client_organization_id}`}
            >
              <div className="flex gap-3">
                <AvatarDisplayer
                  displayName={
                    order.client?.settings?.name ?? order.client?.name
                  }
                  pictureUrl={
                    order.client?.settings?.picture_url ??
                    order.client?.picture_url
                  }
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-600 line-clamp-1">
                    {order.client?.settings?.name ?? order.client?.name ?? ""}
                  </span>
                  <span className="text-sm text-gray-600 line-clamp-1">
                    {order.client_organization?.name
                      ? order.client_organization?.name
                      : ""}
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex gap-3">
              <AvatarDisplayer
                displayName={order.client?.settings?.name ?? order.client?.name}
                pictureUrl={
                  order.client?.settings?.picture_url ??
                  order.client?.picture_url
                }
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">
                  {order.client?.settings?.name ?? order.client?.name ?? ""}
                </span>
                <span className="text-sm text-gray-600">
                  {order.client_organization?.name
                    ? order.client_organization?.name
                    : ""}
                </span>
              </div>
            </div>
          )}
        </div>
        {canAddAssignes ? (
          <>
            <div>
              <div className="flex items-center justify-between py-1.5">
                <span className="flex text-sm font-medium items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />{" "}
                  {t("details.deadline")}{" "}
                </span>
                <DatePicker
                  updateFn={changeDate.mutate}
                  defaultDate={order.due_date}
                />
              </div>
              <div className="flex items-center justify-between py-1.5">
                <div className="flex text-sm font-medium items-center">
                  <Loader className="mr-2 h-4 w-4" />
                  {t("details.status")}
                </div>

                <StatusCombobox
                  order={order}
                  agency_id={order.agency_id}
                  mode="order"
                />
              </div>
              <div className="flex items-center justify-between py-1.5">
                <div className="flex text-sm font-medium items-center">
                  <FlagIcon className="mr-2 h-4 w-4" />
                  {t("details.priority")}
                </div>
                <PriorityCombobox order={order} mode={"order"} />
              </div>
              {creditsEnabled && (
                <CreditsInput
                  agencyId={order.agency_id}
                  clientOrganizationId={order.client_organization_id}
                  userId={userId}
                  orderId={order.id}
                  creditOperationValue={order.credit?.quantity}
                  canAddCredits={true}
                  orderTitle={order.title}
                />
              )}
            </div>
            <div>
              <ActivityAssignations
                searchUserOptions={searchUserOptions}
                assignedTo={order.assigned_to}
                updateFunction={changeAgencyMembersAssigned.mutate}
                canAddAssignes={canAddAssignes}
                isLoading={isLoadingAssignees}
              />
            </div>
            <div>
              <ActivityFollowers
                searchUserOptions={
                  order.client_organization_id === order.agency_id
                    ? searchUserOptions
                    : searchUserOptionsFollowers
                }
                followers={order.followers}
                updateFunction={changeAgencyMembersFollowers.mutate}
                canAddFollowers={canAddFollowers}
                isLoading={isLoadingFollowers}
              />
            </div>
            <div>
              <ActivityTags
                organizationId={order.agency_id}
                orderId={order.id}
                updateFunction={changeOrderTags.mutate}
                searchTagOptions={agencyTags}
                canAddTags={canAddAssignes}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex text-sm font-semibold">
                <CalendarIcon className="mr-2 h-4 w-4" />{" "}
                {t("details.deadline")}{" "}
              </span>
              <span className="pl-2 pr-2 text-sm items-center flex justify-center">
                {order.due_date
                  ? getFormattedDateRange(
                      {
                        from: parseISO(order.due_date),
                        to: parseISO(order.due_date),
                      },
                      language,
                      true,
                    )
                  : t("details.deadlineNotSet", { ns: "orders" })}
              </span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex">
                <Loader className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("details.status")}
                </span>
              </div>
              <StatusCombobox
                order={order}
                agency_id={order.agency_id}
                mode="order"
                blocked={true}
              />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="flex">
                <FlagIcon className="mr-2 h-4 w-4" />
                <span className="text-sm font-medium">
                  {t("details.priority")}
                </span>
              </div>
              <PriorityCombobox mode={"order"} order={order} blocked={true} />
            </div>
            {creditsEnabled && (
              <CreditsInput
                agencyId={order.agency_id}
                clientOrganizationId={order.client_organization_id}
                userId={userId}
                orderId={order.id}
                creditOperationValue={order.credit?.quantity}
                canAddCredits={false}
                orderTitle={order.title}
              />
            )}
            <div className="mb-4 flex items-center">
              <ActivityAssignations
                searchUserOptions={searchUserOptions}
                assignedTo={order.assigned_to}
                updateFunction={changeAgencyMembersAssigned.mutate}
                canAddAssignes={canAddAssignes}
                isLoading={isLoadingAssignees}
              />
            </div>

            <div className="mb-4 flex items-center">
              <ActivityFollowers
                searchUserOptions={
                  order.client_organization_id === order.agency_id
                    ? searchUserOptions
                    : searchUserOptionsFollowers
                }
                followers={order.followers}
                updateFunction={changeAgencyMembersFollowers.mutate}
                canAddFollowers={canAddFollowers}
                isLoading={isLoadingFollowers}
              />
            </div>
          </div>
        )}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("shareProject")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                🔒 {t("shareProjectDescription")}
              </p>
              <div>
                <p>{t("link")}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    disabled={!tokenId}
                    value={`${baseUrl}/orders/${order.id}?public_token_id=${tokenId}`}
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                  />
                  <ThemedButton
                    variant="default"
                    onClick={handleCopy}
                    className="flex items-center gap-2"
                    disabled={!tokenId}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </ThemedButton>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AgencyStatusesProvider>
  );
};

// IMPORTANT: don't add any more functionalities to this component
// IMPORTANT: Modularize this component to be able to reuse it in the chat component

export default AsideOrderInformation;
