import { loadUserWorkspace } from '../home/(user)/_lib/server/load-user-workspace';
import { getOrganizationSettingsByOrganizationId } from 'node_modules/@kit/team-accounts/src/server/actions/organizations/get/get-organizations';
import { OrganizationSettings } from '~/lib/organization-settings.types';
import { redirect } from 'next/navigation';
import pathsConfig from '~/config/paths.config';

export default async function CalendarPage() {
  const { organization, agency, workspace } = await loadUserWorkspace();

  const organizationSettings = await getOrganizationSettingsByOrganizationId(agency ? agency.id : organization?.id ?? '', true, ['calendar_url']).catch((err) => {
    console.error(`Error client, getting organization settings: ${err}`)
    return []
  });

  const calendarUrl = organizationSettings?.find((setting) => setting.key === OrganizationSettings.KEYS.calendar_url)?.value;

  if (!calendarUrl) {
    return redirect(pathsConfig.app.orders);
  }

  const clientRoles = new Set(['client_owner', 'client_member']);
  const urlHasUserIds = calendarUrl.includes('userIds=');
  if (urlHasUserIds && clientRoles.has(workspace.role ?? '')) {
    const userIds = new URL(calendarUrl).searchParams.get('userIds')?.split(',') ?? [];
    if (!userIds.includes(workspace.id ?? '')) {
      return redirect(pathsConfig.app.orders);
    }
  }

  return (
      <div className="flex h-full border-t">
        <iframe src={calendarUrl} className="w-full h-full" />
      </div>
  );
}
