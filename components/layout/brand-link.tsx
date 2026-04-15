// components/layout/brand-link.tsx
import Link from "next/link";

type BrandLinkProps = {
  compact?: boolean;
  href?: string;
};

export default function BrandLink({
  compact = false,
  href = "/",
}: BrandLinkProps) {
  return (
    <Link
      href={href}
      aria-label="Go to Flowstate home"
      className="inline-flex items-center gap-3 rounded-2xl px-2 py-2 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
        F
      </span>

      {!compact && (
        <span className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.22em] text-black/60">
            Flowstate
          </span>
          <span className="text-base font-semibold text-black">Home</span>
        </span>
      )}
    </Link>
  );
}