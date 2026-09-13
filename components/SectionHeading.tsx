import Link from "next/link";

/** Heading row for a stacked homepage section, with an optional "View all" link. */
export function SectionHeading({
  id,
  title,
  href,
  linkLabel = "View all",
}: {
  id: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-sm font-medium text-primary hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
