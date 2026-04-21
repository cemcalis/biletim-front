"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { apiGet, apiRequest } from "@/lib/api";
import { AdminPageShell, AdminRole } from "@/components/admin-page-shell";
import { SidebarItem } from "@/components/collapsible-sidebar";

const menuItems: SidebarItem[] = [
  { label: "Ana Sayfa", href: "/admin", key: "overview" },
  { label: "Seferler", href: "/admin#trips", key: "trips" },
  { label: "Firma Başvuruları", href: "/admin#requests", key: "requests" },
  { label: "Firmalar", href: "/admin#companies", key: "companies" },
  { label: "Kullanıcı Yönetimi", href: "/admin/users", key: "users" },
  { label: "Raporlar", href: "/admin#reports", key: "reports" },
  { label: "Ayarlar", href: "/admin#settings", key: "settings" },
];

type AdminUser = {
  id: string;
  name: string;
  email: string;
  isCompany: boolean;
  createdAt: string;
};

type AdminUsersResponse = {
  ok: boolean;
  users?: AdminUser[];
  message?: string;
};

function readStoredRole(): AdminRole {
  if (typeof window === "undefined") {
    return "super-admin";
  }
  return (localStorage.getItem("admin_role") as AdminRole | null) ?? "super-admin";
}

function readStoredToken(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return localStorage.getItem("admin_token") ?? "";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AdminRole>("super-admin");
  const [username, setUsername] = useState("admin");
  const [token, setToken] = useState("");

  useEffect(() => {
    setRole(readStoredRole());
    setUsername(localStorage.getItem("admin_username") ?? "admin");
    setToken(readStoredToken());
  }, []);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      setMessage("");
      const adminToken = readStoredToken();

      if (!adminToken) {
        setMessage("Yönetici tokeni bulunamadı. Lütfen yeniden giriş yapın.");
        setUsers([]);
        setLoading(false);
        return;
      }

      try {
        const response = await apiGet<AdminUsersResponse>(`/admin/users?token=${encodeURIComponent(adminToken)}`);
        if (!response.ok || !response.users) {
          setMessage(response.message || "Kullanıcılar yüklenemedi.");
          setUsers([]);
        } else {
          setUsers(response.users);
        }
      } catch {
        setMessage("Kullanıcı listesi yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [token]);

  const filteredUsers = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("tr-TR");
    return users.filter((user) => {
      if (!needle) return true;
      return [user.name, user.email].some((value) => value.toLocaleLowerCase("tr-TR").includes(needle));
    });
  }, [search, users]);

  const metrics = useMemo(
    () => [
      { label: "Kullanıcı", value: filteredUsers.length },
      { label: "Toplam", value: users.length },
      { label: "Aktif rol", value: role },
    ],
    [filteredUsers.length, role, users.length],
  );

  async function deleteUser(userId: string, email: string) {
    setMessage("");
    const adminToken = readStoredToken();
    if (!adminToken) {
      setMessage("Yönetici tokeni bulunamadı.");
      return;
    }

    try {
      const result = await apiRequest<{ ok: boolean; message?: string }>(
        "/admin/users/delete",
        "POST",
        { token: adminToken, userId },
      );

      if (!result.ok) {
        setMessage(result.message || `${email} silinemedi.`);
        return;
      }

      setMessage(`${email} başarıyla silindi.`);
      setUsers((current) => current.filter((user) => user.id !== userId));
    } catch {
      setMessage(`${email} silinemedi. Lütfen tekrar deneyin.`);
    }
  }

  return (
    <AdminPageShell
      title="Near East Way"
      subtitle="Yönetici araçları"
      active="users"
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
      topBadgeLabel="Kullanıcı Yönetimi"
    >
      <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Kullanıcı Yönetimi</Typography>
            <Typography sx={{ mt: 0.5, fontSize: "0.84rem", color: "#6c768b" }}>
              Rezervasyon yapan yolcuları tek ekranda görüntüleyin.
            </Typography>
          </Box>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.5, py: 1, borderRadius: 999, background: "#eef4ff", color: "#2b60d4", fontSize: "0.8rem", fontWeight: 700 }}>
            <GroupOutlinedIcon sx={{ fontSize: 18 }} />
            {filteredUsers.length} kayıt
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {metrics.map((item) => (
            <Paper key={item.label} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #d5deee", background: "#eef3fb", boxShadow: "none" }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#6f7890" }}>{item.label}</Typography>
              <Typography sx={{ mt: 0.5, fontSize: "1.35rem", fontWeight: 800, color: "#1d2d4d" }}>{item.value}</Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <TextField size="small" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="İsim, e-posta, rota ara..." sx={{ minWidth: { xs: "100%", md: 320 } }} />
        </Box>

        {message ? <Typography sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: "#ecf2ff", color: "#285fdf", fontSize: "0.85rem" }}>{message}</Typography> : null}

        {loading ? (
          <Typography sx={{ mt: 2 }}>Kullanıcılar yükleniyor...</Typography>
        ) : (
          <Box sx={{ mt: 2.5, display: "grid", gap: 1.5 }}>
            {filteredUsers.length === 0 ? (
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
                <Typography>Kayıtlı kullanıcı bulunamadı.</Typography>
              </Paper>
            ) : (
              filteredUsers.map((user) => (
                <Paper key={user.email} elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 800 }}>{user.name || "Adı yok"}</Typography>
                      <Typography sx={{ mt: 0.5, fontSize: "0.85rem", color: "#5b6b87" }}>{user.email}</Typography>
                      <Typography sx={{ mt: 0.5, fontSize: "0.82rem", color: "#5b6b87" }}>
                        Üyelik tarihi: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                      <Typography sx={{ fontSize: "0.82rem", color: "#6c768b" }}>Tip</Typography>
                      <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#2a64e8" }}>
                        {user.isCompany ? "Firma" : "Bireysel"}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      onClick={() => deleteUser(user.id, user.email)}
                      sx={{ textTransform: "none", borderRadius: 2, alignSelf: "center" }}
                    >
                      Kullanıcıyı Sil
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}
      </Paper>
    </AdminPageShell>
  );
}