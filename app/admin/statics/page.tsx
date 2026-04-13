"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { apiGet } from "../../../lib/api";
import { AdminPageShell, AdminRole } from "@/components/admin-page-shell";
import { SidebarItem } from "@/components/collapsible-sidebar";

type AdminOverviewResponse = {
  metrics: {
    totalBookings: number;
    activeUsers: number;
    busRoutes: number;
    revenue: number;
  };
  revenueTrend?: Array<{ month: string; value: number }>;
  popularRoutes?: Array<{ label: string; value: number; color: string }>;
};

const menuItems: SidebarItem[] = [
  { label: "Ana Sayfa", href: "/admin", key: "overview" },
  { label: "Seferler", href: "/admin#trips", key: "trips" },
  { label: "Firma Başvuruları", href: "/admin#requests", key: "requests" },
  { label: "Kullanıcı Yönetimi", href: "/admin/users", key: "users" },
  { label: "Raporlar", href: "/admin#reports", key: "reports" },
  { label: "Ayarlar", href: "/admin#settings", key: "settings" },
];

function readStoredRole(): AdminRole {
  if (typeof window === "undefined") {
    return "super-admin";
  }
  return (localStorage.getItem("admin_role") as AdminRole | null) ?? "super-admin";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

export default function AdminStaticsPage() {
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [role, setRole] = useState<AdminRole>("super-admin");
  const [username, setUsername] = useState("admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRole(readStoredRole());
    setUsername(localStorage.getItem("admin_username") ?? "admin");
  }, []);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      try {
        const data = await apiGet<AdminOverviewResponse>("/admin/overview");
        setOverview(data);
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, []);

  const metrics = useMemo(
    () => [
      { label: "Sefer", value: overview?.metrics.totalBookings ?? 0 },
      { label: "Aktif kullanıcı", value: overview?.metrics.activeUsers ?? 0 },
      { label: "Hat", value: overview?.metrics.busRoutes ?? 0 },
      { label: "Gelir", value: formatCurrency(overview?.metrics.revenue ?? 0) },
    ],
    [overview],
  );

  return (
    <AdminPageShell
      title="Near East Way"
      subtitle="Raporlar"
      active="reports"
      username={username}
      role={role}
      onRoleChange={setRole}
      onLogout={() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_role");
        localStorage.removeItem("admin_company");
        window.location.href = "/admin";
      }}
      items={menuItems}
      primaryActionHref="/admin"
      primaryActionLabel="Ana Panele Dön"
      topBadgeLabel="Raporlar"
    >
      <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Raporlar ve Özetler</Typography>
            <Typography sx={{ mt: 0.5, fontSize: "0.84rem", color: "#6c768b" }}>
              Gelir trendleri ve popüler rotalar.
            </Typography>
          </Box>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.5, py: 1, borderRadius: 999, background: "#eef4ff", color: "#2b60d4", fontSize: "0.8rem", fontWeight: 700 }}>
            <TrendingUpRoundedIcon sx={{ fontSize: 18 }} />
            {loading ? "Yükleniyor" : "Hazır"}
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" } }}>
          {metrics.map((item) => (
            <Paper key={item.label} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #d5deee", background: "#eef3fb", boxShadow: "none" }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#6f7890" }}>{item.label}</Typography>
              <Typography sx={{ mt: 0.5, fontSize: "1.35rem", fontWeight: 800, color: "#1d2d4d" }}>{item.value}</Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{ mt: 2.5, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800 }}>Gelir Trendi</Typography>
            <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
              {(overview?.revenueTrend ?? []).map((item) => (
                <Box key={item.month} sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 2, alignItems: "center" }}>
                  <Typography sx={{ fontSize: "0.84rem", color: "#5b6b87" }}>{item.month}</Typography>
                  <Typography sx={{ fontSize: "0.84rem", fontWeight: 700 }}>{formatCurrency(item.value)}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800 }}>Popüler Rotalar</Typography>
            <Box sx={{ mt: 2, display: "grid", gap: 1 }}>
              {(overview?.popularRoutes ?? []).map((item) => (
                <Box key={item.label} sx={{ display: "grid", gap: 0.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Typography sx={{ fontSize: "0.84rem", color: "#5b6b87" }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: "0.84rem", fontWeight: 700 }}>{item.value}%</Typography>
                  </Box>
                  <Box sx={{ height: 8, borderRadius: 999, background: "#eef2f8", overflow: "hidden" }}>
                    <Box sx={{ width: `${item.value}%`, height: "100%", borderRadius: 999, background: item.color }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Paper>
    </AdminPageShell>
  );
}
