import Header from './header';
import Navigation from './section-view';


interface OrganizationSectionProps {
  name: string;
  logo?: string;
  owner: string;
  clientOrganizationId: string;
}
function OrganizationSection({
  name,
  logo,
  owner,
  clientOrganizationId,
}: OrganizationSectionProps) {
  return (
    <div className="flex flex-col gap-8 p-8">
      <Header name={name} logo={logo} owner={owner} />
      <Navigation clientOrganizationId={clientOrganizationId} />
    </div>
  );
}

export default OrganizationSection;