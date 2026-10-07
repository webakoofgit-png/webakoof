import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
export function AdminLink({
  to,
  children,
  ...props
}: {
  to: string;
  children: ReactNode;
  className?: string;
  title?: string;
  hash?: string;
}) {
  return to === "/admin" ? (
    <Link to="/admin" {...props}>
      {children}
    </Link>
  ) : (
    <Link to="/admin/$" params={{ _splat: to.replace(/^\/admin\//, "") }} {...props}>
      {children}
    </Link>
  );
}
