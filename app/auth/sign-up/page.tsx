// app/auth/sign-up/page.tsx

import LogoLink from "@/components/branding/logo-link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f8f8f5] text-[#111111]">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        {/* Left Brand Panel */}
        <section className="hidden lg:flex flex-col justify-center pr-8">
          <div className="mb-8">
            <LogoLink href="/" size={64} showText />
          </div>

          <p className="text-sm uppercase tracking-[0.22em] text-[#667085]">
            Create your account
          </p>

          <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight">
            Work with more clarity and less chaos.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-[#5f6670]">
            Flowstate helps freelancers, teams, agencies, and households
            organize projects, tasks, schedules, and collaboration in one calm
            workspace.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#667085]">Projects</p>
              <p className="mt-2 text-2xl font-semibold">Organized</p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#667085]">Tasks</p>
              <p className="mt-2 text-2xl font-semibold">Focused</p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#667085]">Schedules</p>
              <p className="mt-2 text-2xl font-semibold">Clear</p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-sm text-[#667085]">Workflow</p>
              <p className="mt-2 text-2xl font-semibold">Calm</p>
            </div>
          </div>
        </section>

        {/* Right Form Panel */}
        <section className="w-full max-w-md justify-self-center">
          <div className="mb-8 flex justify-center lg:hidden">
            <LogoLink href="/" size={56} showText />
          </div>

          <div className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.06)] sm:p-8">
            <SignUpForm />
          </div>
        </section>
      </div>
    </main>
  );
}