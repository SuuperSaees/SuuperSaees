import { BadgeX, Ban, ShieldPlus, VenetianMask, CalendarIcon, RefreshCw, Users, User, Mail, CreditCard, Package2, Tag, Hash } from 'lucide-react';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';

import { AdminBanUserDialog } from './admin-ban-user-dialog';
import { AdminDeleteAccountDialog } from './admin-delete-account-dialog';
import { AdminDeleteUserDialog } from './admin-delete-user-dialog';
import { AdminImpersonateUserDialog } from './admin-impersonate-user-dialog';
import { AdminMembersTable } from './admin-members-table';
import { AdminMembershipsTable } from './admin-memberships-table';
import { AdminReactivateUserDialog } from './admin-reactivate-user-dialog';

type Db = Database['public']['Tables'];
type Account = Db['accounts']['Row'];
type Organization = Db['organizations']['Row'];
type Membership = Db['accounts_memberships']['Row'];

// Helper function to safely format dates
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return '-';
  }
}

export function AdminAccountPage(props: {
  account: Account | Organization & { memberships: Membership[] };
  isPersonalAccount: boolean;
}) {

  if (props.isPersonalAccount) {
    return <PersonalAccountPage account={props.account as Account} />;
  }

  return <TeamAccountPage account={props.account as Organization & { memberships: Membership[] }} />;
}

async function PersonalAccountPage(props: { account: Account }) {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const memberships = await getMemberships(props.account.id);
  const { data, error } = await client.auth.admin.getUserById(props.account.id);

  if (!data || error) {
    throw new Error(`User not found, admin account page`);
  }

  const isBanned =
    'banned_until' in data.user && data.user.banned_until !== 'none';

  // Format dates safely
  const createdAt = formatDate(props.account.created_at);
  const updatedAt = formatDate(props.account.updated_at);

  return (
    <div className="flex flex-col space-y-6 ">
      {/* Header Card with Account Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ProfileAvatar
                pictureUrl={props.account.picture_url}
                displayName={props.account.name}
                className="h-16 w-16"
              />
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{props.account.name}</h2>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="mr-1 h-4 w-4" />
                  <span>{props.account.email}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 flex items-center">
                    <User className="mr-1 h-3 w-3" />
                    <span>Personal Account</span>
                  </Badge>
                  <If condition={isBanned}>
                    <Badge variant="destructive" className="flex items-center">
                      <Ban className="mr-1 h-3 w-3" />
                      <span>Banned</span>
                    </Badge>
                  </If>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <If condition={isBanned}>
                <AdminReactivateUserDialog userId={props.account.id}>
                  <Button size="sm" variant="outline" className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100">
                    <ShieldPlus className="mr-1.5 h-4 w-4" />
                    Reactivate
                  </Button>
                </AdminReactivateUserDialog>
              </If>

              <If condition={!isBanned}>
                <AdminBanUserDialog userId={props.account.id}>
                  <Button size="sm" variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                    <Ban className="mr-1.5 h-4 w-4" />
                    Ban
                  </Button>
                </AdminBanUserDialog>

                <AdminImpersonateUserDialog userId={props.account.id}>
                  <Button size="sm" variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                    <VenetianMask className="mr-1.5 h-4 w-4" />
                    Impersonate
                  </Button>
                </AdminImpersonateUserDialog>
              </If>

              <AdminDeleteUserDialog userId={props.account.id}>
                <Button size="sm" variant="destructive">
                  <BadgeX className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </AdminDeleteUserDialog>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Account ID</span>
              <div className="flex items-center">
                <Hash className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <span className="text-sm font-mono">{props.account.id}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Created At</span>
              <div className="flex items-center">
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <span className="text-sm">{createdAt}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Updated At</span>
              <div className="flex items-center">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <span className="text-sm">{updatedAt}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
            <CardTitle>Subscription</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SubscriptionsTable accountId={props.account.id} />
        </CardContent>
      </Card>

      {/* Teams Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-muted-foreground" />
            <CardTitle>Teams</CardTitle>
          </div>
          <CardDescription>Teams this user belongs to</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminMembershipsTable memberships={memberships} />
        </CardContent>
      </Card>
    </div>
  );
}

async function TeamAccountPage(props: {
  account: Organization & { memberships: Membership[] };
}) {
  const members = await getMembers(props.account.slug ?? '');

  // Format dates safely
  const createdAt = formatDate(props.account.created_at);
  const updatedAt = formatDate(props.account.updated_at);

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Card with Account Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ProfileAvatar
                pictureUrl={props.account.picture_url}
                displayName={props.account.name}
                className="h-16 w-16"
              />
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{props.account.name}</h2>
                <div className="flex items-center text-muted-foreground">
                  <Mail className="mr-1 h-4 w-4" />
                  <span>{props.account.owner_id}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    <span>Team Account</span>
                  </Badge>
                </div>
              </div>
            </div>

            <AdminDeleteAccountDialog accountId={props.account.id}>
              <Button size="sm" variant="destructive">
                <BadgeX className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </AdminDeleteAccountDialog>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Account ID</span>
              <div className="flex items-center">
                <Hash className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <span className="text-sm font-mono">{props.account.id}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Slug</span>
              <div className="flex items-center">
                <Tag className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <span className="text-sm">{props.account.slug}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Created At</span>
              <div className="flex items-center">
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <span className="text-sm">{createdAt}</span>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Updated At</span>
              <div className="flex items-center">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <span className="text-sm">{updatedAt}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
            <CardTitle>Subscription</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SubscriptionsTable accountId={props.account.id} />
        </CardContent>
      </Card>

      {/* Team Members Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-muted-foreground" />
            <CardTitle>Team Members</CardTitle>
          </div>
          <CardDescription>Members of this team account</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminMembersTable members={members} />
        </CardContent>
      </Card>
    </div>
  );
}

async function SubscriptionsTable(props: { accountId: string }) {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const { data: subscription, error } = await client
    .from('subscriptions')
    .select('*, subscription_items !inner (*)')
    .eq('account_id', props.accountId)
    .maybeSingle();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>There was an error loading subscription.</AlertTitle>
        <AlertDescription>
          Please check the logs for more information or try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!subscription) {
    return (
      <Alert variant="default" className="bg-gray-50 border-gray-200">
        <div className="flex items-center">
          <Package2 className="h-4 w-4 mr-2 text-gray-400" />
          <AlertTitle>No subscription found</AlertTitle>
        </div>
        <AlertDescription className="mt-2 text-muted-foreground">
          This account does not have an active subscription.
        </AlertDescription>
      </Alert>
    );
  }

  // Format dates safely
  const createdAt = formatDate(subscription.created_at);
  const periodStartsAt = formatDate(subscription.period_starts_at);
  const periodEndsAt = formatDate(subscription.period_ends_at);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
          <div className="text-xs text-muted-foreground mb-1">Status</div>
          <div className="flex items-center">
            <Badge 
              variant={subscription.status === 'active' ? 'default' : 'outline'}
              className={subscription.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
            >
              {subscription.status}
            </Badge>
          </div>
        </div>
        <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
          <div className="text-xs text-muted-foreground mb-1">Provider</div>
          <div className="text-sm">{subscription.billing_provider}</div>
        </div>
        <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
          <div className="text-xs text-muted-foreground mb-1">Customer ID</div>
          <div className="text-sm font-mono text-xs truncate">{subscription.billing_customer_id}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
          <div className="text-xs text-muted-foreground mb-1">Created</div>
          <div className="flex items-center">
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="text-sm">{createdAt}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
          <div className="text-xs text-muted-foreground mb-1">Period Starts</div>
          <div className="flex items-center">
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="text-sm">{periodStartsAt}</span>
          </div>
        </div>
        <div className="bg-gray-50 rounded-md p-3 border border-gray-100">
          <div className="text-xs text-muted-foreground mb-1">Period Ends</div>
          <div className="flex items-center">
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
            <span className="text-sm">{periodEndsAt}</span>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center">
          <Package2 className="h-4 w-4 mr-1.5 text-gray-400" />
          Subscription Items
        </h3>
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Variant ID</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscription.subscription_items.map((item) => (
                <TableRow key={item.variant_id}>
                  <TableCell className="font-mono text-xs">{item.product_id}</TableCell>
                  <TableCell className="font-mono text-xs">{item.variant_id}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.price_amount}</TableCell>
                  <TableCell>{item.interval}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {item.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

async function getMemberships(userId: string) {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const memberships = await client
    .from('accounts_memberships')
    .select<
      string,
      Membership & {
        account: {
          id: string;
          name: string;
        };
      }
    >('*, account: organization_id !inner (id, name)')
    .eq('user_id', userId);

  if (memberships.error) {
    throw memberships.error;
  }

  return memberships.data;
}

async function getMembers(organizationSlug: string) {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });

  const members = await client.rpc('get_account_members', {
    organization_slug: organizationSlug,
  });

  if (members.error) {
    throw members.error;
  }

  return members.data;
}
