import Header from './header';
import SectionView from './section-view';


interface OrganizationSectionProps {
  name: string;
  logo?: string;
  owner: {
    id: string;
    name: string;
    email?: string | null;
  };
  clientOrganizationId: string;
  currentUserRole: string;
  agencyId: string;
}
function OrganizationSection({
  name,
  logo,
  owner,
  clientOrganizationId,
  currentUserRole,
  agencyId,
}: OrganizationSectionProps) {
  return (
    <div className="flex h-full flex-col gap-8 p-8">
      <Header name={name} logo={logo} owner={owner} currentUserRole={currentUserRole} id={clientOrganizationId} />
      <SectionView
        clientOrganizationId={clientOrganizationId}
        currentUserRole={currentUserRole}
        agencyId={agencyId}
      />
    </div>
  );
}

export default OrganizationSection;