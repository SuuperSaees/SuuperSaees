import PageHeader from '~/components/page-header';

import NavigationBar from './components/navigation-bar';

export default function OrderDetailsLayout({
  children,
  params: { id },
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 p-8">
      <PageHeader i18nKey={'orders:details.title'} />
      <NavigationBar orderId={id} />
      {children}
    </div>
  );
}
