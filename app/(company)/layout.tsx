import { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";

export default function CompanyLayout({ children }: PropsWithChildren) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px", display: "flex", justifyContent: "center" }}>
        <a href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 24, height: 24, background: "#D4AF37", borderRadius: "3px" }} />
          <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "#002D62" }}>
            Near East Way
          </span>
        </a>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        {children}
      </div>
    </div>
  );
}
