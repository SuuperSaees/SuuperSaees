export default function OrderDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gap-4 px-8">
      {children}
    </div>
  );
}
