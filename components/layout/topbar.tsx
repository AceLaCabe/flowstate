// components/layout/topbar.tsx
import BrandLink from "./brand-link";

type TopbarProps = {
  firstName?: string;
  lastName?: string;
  title: string;
  avatarUrl?: string | null;
  onOpenMenu?: () => void;
};

function getInitials(firstName?: string, lastName?: string) {
  const first = firstName?.trim().charAt(0).toUpperCase() || "";
  const last = lastName?.trim().charAt(0).toUpperCase() || "";
  return (first + last) || "U";
}

export default function Topbar({
  firstName,
  lastName,
  title,
  avatarUrl,
  onOpenMenu,
}: TopbarProps) {
  return (
    <header className="border-b border-black/10 bg-white/80 px-4 py-3 backdrop-blur sm:px-5 md:px-8 md:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/10 text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 md:hidden"
          >
            ☰
          </button>

          <div className="md:hidden">
            <BrandLink compact href="/dashboard" />
          </div>

          <div className="hidden md:block">
            <p className="text-sm text-black/65">Welcome back</p>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-black text-sm font-semibold text-white">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={`${firstName || "User"} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>{getInitials(firstName, lastName)}</span>
            )}
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-xs text-black/55">Account</p>
            <p className="text-sm font-medium text-black">
              {firstName || "User"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}