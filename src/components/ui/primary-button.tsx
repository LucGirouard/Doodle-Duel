import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

const baseClassName =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-amber-800 bg-amber-800 px-6 py-3 text-sm font-semibold text-amber-50 transition duration-200 hover:bg-amber-700";

type PrimaryLinkButtonProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
};

export function PrimaryLinkButton({
  href,
  className = "",
  children,
}: PrimaryLinkButtonProps) {
  return (
    <Link href={href} className={`${baseClassName} ${className}`.trim()}>
      {children}
    </Link>
  );
}

export function PrimaryButton({
  className = "",
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button className={`${baseClassName} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}