export function AuthLayoutShell({
  children,
  Logo,
}: React.PropsWithChildren<{
  Logo: React.ComponentType;
}>) {
  return (
    <div className="flex justify-center text-center items-center h-screen w-screen">
        {children}
    </div>
  );
}
