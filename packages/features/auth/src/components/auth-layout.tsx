export function AuthLayoutShell({
  children,
  Logo,
}: React.PropsWithChildren<{
  Logo: React.ComponentType;
}>) {
  return (
    <div className="flex justify-between items-center h-screen w-screen px-10">
        {children}
    </div>
  );
}
