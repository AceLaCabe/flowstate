// components/layout/topbar.tsx

import BrandLink from "./brand-link";
import LogoutButton from "@/components/auth/logout-button";

type TopbarProps = {
  firstName?: string;
  lastName?: string;
  title: string;
  context?: string;
  avatarUrl?: string | null;
  onOpenMenu?: () => void;
};

function getInitials(firstName?: string, lastName?: string) {
  const first = firstName?.trim().charAt(0).toUpperCase() || "";
  const last = lastName?.trim().charAt(0).toUpperCase() || "";

  return first + last || "U";
}

export default function Topbar({
  firstName,
  lastName,
  title,
  context,
  avatarUrl,
  onOpenMenu,
}: TopbarProps) {
  return (
    <header className="border-b border-black/10 bg-white/80 px-4 py-3 backdrop-blur sm:px-5 md:px-8 md:py-4">
      <div className="flex items-center justify-between gap-3">
        {/* NAVIGATION AND PAGE CONTEXT */}

        <div className="flex min-w-0 items-center gap-3">
          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/10 text-black transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 md:hidden"
          >
            ☰
          </button>

          {/* MOBILE BRAND */}

          <div className="md:hidden">
            <BrandLink compact href="/dashboard" />
          </div>

          {/* DESKTOP PAGE INFORMATION */}

          <div className="hidden min-w-0 md:block">
            <p className="truncate text-xs font-medium text-black/50">
              {context || "Workspace"}
            </p>

            <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-black lg:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        {/* ACCOUNT CONTROLS */}

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs text-black/55">
              Account
            </p>

            <p className="text-sm font-medium text-black">
              {firstName || "User"}
            </p>
          </div>

          {/* PROFILE AVATAR */}

          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-black text-sm font-semibold text-white">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={`${firstName || "User"} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span>
                {getInitials(firstName, lastName)}
              </span>
            )}
          </div>

          {/* LOGOUT */}

          <LogoutButton
            className="hidden rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
          />
        </div>
      </div>
    </header>
  );
}