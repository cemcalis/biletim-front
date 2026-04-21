import { PropsWithChildren } from "react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Dashboard | Near East Way",
  description: "Kurumsal seyahat planlamasında güvenin adresi.",
};

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f1f5f9" }}>
      {children}
    </div>
  );
}
