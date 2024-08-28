// import PageHeader from '~/components/page-header';

export default function OrderDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-8">
      {/* <PageHeader i18nKey={'orders:details.title'} /> */}
      {children}
    </div>
  );
}
