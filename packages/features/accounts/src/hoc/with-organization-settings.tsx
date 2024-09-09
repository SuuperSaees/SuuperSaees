import dynamic from 'next/dynamic';

const OrganizationSettingsProvider = dynamic(
  () => import('../context/organization-settings-context'),
  { ssr: false },
);
// Higher-Order Component that wraps the provided component with OrganizationSettingsProvider
const withOrganizationSettings = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P> => {
  return function WithOrganizationSettings(props: P) {
    return (
      <OrganizationSettingsProvider>
        <WrappedComponent {...props} />
      </OrganizationSettingsProvider>
    );
  };
};

export default withOrganizationSettings;
