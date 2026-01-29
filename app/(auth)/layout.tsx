export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/60">
      <div className="w-full max-w-md px-4">{children}</div>
    </div>
  );
}
