export default function OrderDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gap-4 px-8 max-h-lvh h-full overflow-y-hidden flex flex-col">
      {children}
    </div>
  );
}
