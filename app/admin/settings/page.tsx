"use client";

import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { AdminPageShell, AdminRole } from "@/components/admin-page-shell";
import { SidebarItem } from "@/components/collapsible-sidebar";

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

export default function AdminSettingsPage() {
  const [role, setRole] = useState<AdminRole>("super-admin");
  const [username, setUsername] = useState("admin");
  const [sessionStatus, setSessionStatus] = useState("Pasif");

  useEffect(() => {
    setRole(readStoredRole());
    setUsername(localStorage.getItem("admin_username") ?? "admin");
    setSessionStatus(localStorage.getItem("admin_token") ? "Aktif" : "Pasif");
  }, []);

  return (
    <AdminPageShell
      title="Near East Ulasim"
      subtitle="Ayarlar"
      active="settings"
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
      topBadgeLabel="Ayarlar"
    >
      <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Ayarlar</Typography>
            <Typography sx={{ mt: 0.5, fontSize: "0.84rem", color: "#6c768b" }}>
              Rol, oturum ve panel davranışlarını yönetin.
            </Typography>
          </Box>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.5, py: 1, borderRadius: 999, background: "#eef4ff", color: "#2b60d4", fontSize: "0.8rem", fontWeight: 700 }}>
            <TuneOutlinedIcon sx={{ fontSize: 18 }} />
            Panel ayarları
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {[
            ["Rol", role],
            ["Oturum", sessionStatus],
            ["Kullanıcı", username],
          ].map(([label, value]) => (
            <Paper key={label} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #d5deee", background: "#eef3fb", boxShadow: "none" }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#6f7890" }}>{label}</Typography>
              <Typography sx={{ mt: 0.5, fontSize: "1.1rem", fontWeight: 800, color: "#1d2d4d" }}>{value}</Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{ mt: 2.5, display: "grid", gap: 1.5 }}>
          <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800 }}>Davranış Notları</Typography>
            <Typography sx={{ mt: 0.75, fontSize: "0.84rem", color: "#5b6b87" }}>
              Rol seçimi artık hem yerelde hem de backend oturumunda tutuluyor. Yetki kontrolü sunucuda uygulanıyor.
            </Typography>
          </Paper>
        </Box>
      </Paper>
    </AdminPageShell>
  );
}
