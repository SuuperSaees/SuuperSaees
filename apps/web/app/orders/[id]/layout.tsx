export default function OrderDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-h-lvh h-full overflow-hidden flex w-full max-w-screen-2xl flex-col gap-4 p-8">
      {children}
    </div>
  );
}
