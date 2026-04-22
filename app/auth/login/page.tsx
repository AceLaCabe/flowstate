// app/auth/login/page.tsx

import LogoLink from "@/components/branding/logo-link";
import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[#f8f8f5] p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <LogoLink href="/" size={52} showText />
        </div>

        <LoginForm />
      </div>
    </div>
  );
}