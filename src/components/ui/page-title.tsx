import { ReactNode } from "react";

type PageTitleProps = {
  children: ReactNode;
  className?: string;
};

export default function PageTitle({
  children,
  className = "",
}: PageTitleProps) {
  return (
    <h1 className={`gradient-title title-font font-black ${className}`.trim()}>
      {children}
    </h1>
  );
}