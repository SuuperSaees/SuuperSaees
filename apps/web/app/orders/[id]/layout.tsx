export default function OrderDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-h-lvh h-full overflow-y-hidden flex w-full max-w-screen-2xl flex-col gap-4 px-8">
      {children}
    </div>
  );
}
