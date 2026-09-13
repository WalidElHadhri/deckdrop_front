export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 md:py-16">
      <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm md:p-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
      {footer && <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>}
    </div>
  );
}
