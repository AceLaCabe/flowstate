// components/branding/logo-link.tsx
import Link from "next/link";
import Image from "next/image";

type LogoLinkProps = {
  href?: string;
  size?: number;
  showText?: boolean;
};

export default function LogoLink({
  href = "/",
  size = 40,
  showText = true,
}: LogoLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      aria-label="Go to homepage"
    >
      <Image
        src="/flowstate-logo.png"
        alt="Flowstate logo"
        width={size}
        height={size}
        priority
        className="object-contain"
      />

      {showText && (
        <span className="text-sm font-medium uppercase tracking-[0.22em] text-[#667085]">
          Flowstate
        </span>
      )}
    </Link>
  );
}