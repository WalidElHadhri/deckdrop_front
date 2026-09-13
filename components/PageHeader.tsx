export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mt-3 mb-6 space-y-2">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      {description && <p className="max-w-prose text-muted-foreground">{description}</p>}
      {children}
    </header>
  );
}
