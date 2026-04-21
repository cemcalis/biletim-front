"use client";

import { PropsWithChildren, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminRoot = pathname === "/admin" || pathname === "/admin/";
  const hasToken =
    typeof window !== "undefined" &&
    (localStorage.getItem("admin_token") ?? "").length > 0;

  useEffect(() => {
    if (!isAdminRoot && !hasToken) {
      router.replace("/admin");
    }
  }, [isAdminRoot, hasToken, router]);

  if (!isAdminRoot && !hasToken) {
    return null;
  }

  return <>{children}</>;
}
