// components/layout/app-shell.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import Sidebar from "./sidebar";
import Topbar from "./topbar";

type AppShellProps = {
  children: React.ReactNode;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
};

type PageInfo = {
  title: string;
  context: string;
};

function getPageInfo(pathname: string): PageInfo {
  if (pathname.startsWith("/projects/")) {
    return {
      title: "Project details",
      context: "Workspace / Projects",
    };
  }

  if (pathname.startsWith("/projects")) {
    return {
      title: "Projects",
      context: "Workspace / Planning",
    };
  }

  if (pathname.startsWith("/tasks")) {
    return {
      title: "Tasks",
      context: "Workspace / My work",
    };
  }

  if (pathname.startsWith("/calendar")) {
    return {
      title: "Calendar",
      context: "Workspace / Schedule",
    };
  }

  if (pathname.startsWith("/assets")) {
    return {
      title: "Assets",
      context: "Workspace / Library",
    };
  }

  if (pathname.startsWith("/team")) {
    return {
      title: "Team",
      context: "Workspace / People",
    };
  }

  if (pathname.startsWith("/settings")) {
    return {
      title: "Settings",
      context: "Account / Preferences",
    };
  }

  return {
    title: "Dashboard",
    context: "Workspace / Overview",
  };
}

export default function AppShell({
  children,
  firstName,
  lastName,
  avatarUrl,
}: AppShellProps) {
  const pathname = usePathname();
  const { title, context } = getPageInfo(pathname);

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#171717]">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-white px-4 py-2 text-black focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:outline-none focus:ring-2 focus:ring-black"
      >
        Skip to main content
      </a>

      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          onNavigate={() => setMobileOpen(false)}
          firstName={firstName}
          lastName={lastName}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar
            firstName={firstName}
            lastName={lastName}
            avatarUrl={avatarUrl}
            title={title}
            context={context}
            onOpenMenu={() => setMobileOpen(true)}
          />

          <section
            id="main-content"
            className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10"
          >
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}