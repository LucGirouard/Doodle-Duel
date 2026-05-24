import { ReactNode } from "react";

type PageCardProps = {
  children: ReactNode;
  className?: string;
};

export default function PageCard({ children, className = "" }: PageCardProps) {
  return (
    <section
      className={`glass-card w-full rounded-[2.5rem] ${className}`.trim()}
    >
      {children}
    </section>
  );
}