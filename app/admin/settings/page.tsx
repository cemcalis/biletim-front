"use client";

import { FormEvent, useEffect, useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { AdminPageShell, AdminRole } from "@/components/admin-page-shell";
import { SidebarItem } from "@/components/collapsible-sidebar";
import { apiGet, apiRequest } from "@/lib/api";

const menuItems: SidebarItem[] = [
  { label: "Ana Sayfa", href: "/admin", key: "overview" },
  { label: "Seferler", href: "/admin#trips", key: "trips" },
  { label: "Firma Başvuruları", href: "/admin#requests", key: "requests" },
  { label: "Firmalar", href: "/admin#companies", key: "companies" },
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [companies, setCompanies] = useState<Array<{ id: string; companyName: string; email: string; status: string }>>([]);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPassword, setCompanyPassword] = useState("");
  const [companyMessage, setCompanyMessage] = useState("");
  const [companyLoading, setCompanyLoading] = useState(false);

  async function loadCompanies() {
    const token = localStorage.getItem("admin_token") ?? "";
    try {
      const response = await apiGet<{ ok: boolean; companies?: Array<{ id: string; companyName: string; email: string; status: string }> }>(
        `/admin/companies?token=${encodeURIComponent(token)}`,
      );
      if (response.ok && response.companies) {
        setCompanies(response.companies);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    setRole(readStoredRole());
    setUsername(localStorage.getItem("admin_username") ?? "admin");
    setSessionStatus(localStorage.getItem("admin_token") ? "Aktif" : "Pasif");

    void loadCompanies();
  }, []);

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError("Lütfen tüm parola alanlarını doldurun.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Yeni şifre ve tekrarı eşleşmiyor.");
      return;
    }

    setPasswordLoading(true);
    const token = localStorage.getItem("admin_token") ?? "";
    try {
      const response = await apiRequest<{ ok: boolean; message?: string }>("/admin/password", "PATCH", {
        token,
        currentPassword,
        newPassword,
      });

      if (response.ok) {
        setPasswordMessage("Şifre başarıyla güncellendi.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(response.message ?? "Şifre güncellenemedi.");
      }
    } catch {
      setPasswordError("Şifre güncelleme isteği başarısız oldu.");
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleAddCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompanyMessage("");

    if (!companyName.trim() || !contactName.trim() || !companyEmail.trim()) {
      setCompanyMessage("Firma adı, iletişim ve e‑posta bilgisi gerekli.");
      return;
    }

    setCompanyLoading(true);
    const token = localStorage.getItem("admin_token") ?? "";
    try {
      const response = await apiRequest<{ ok: boolean; company?: { id: string } }>("/admin/companies", "POST", {
        token,
        company: {
          companyName,
          contactName,
          email: companyEmail,
          password: companyPassword || 'Company123!'.trim(),
        },
      });

      if (response.ok) {
        setCompanyMessage("Firma başarıyla eklendi.");
        setCompanyName("");
        setContactName("");
        setCompanyEmail("");
        setCompanyPassword("");
        await loadCompanies();
      } else {
        setCompanyMessage("Firma eklenemedi.");
      }
    } catch {
      setCompanyMessage("Firma ekleme isteği başarısız oldu.");
    } finally {
      setCompanyLoading(false);
    }
  }

  async function handleDeleteCompany(companyId: string) {
    const token = localStorage.getItem("admin_token") ?? "";
    try {
      const response = await apiRequest<{ ok: boolean }>("/admin/companies/delete", "POST", {
        token,
        companyId,
      });
      if (response.ok) {
        setCompanyMessage("Firma silindi.");
        await loadCompanies();
      }
    } catch {
      setCompanyMessage("Firma silme işlemi başarısız oldu.");
    }
  }

  return (
    <AdminPageShell
      title="Near East Way"
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

        <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
          <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800, mb: 1.5 }}>Yönetici Şifre Değiştir</Typography>
            <Box component="form" onSubmit={handleChangePassword} sx={{ display: "grid", gap: 2 }}>
              <TextField
                label="Mevcut Şifre"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                fullWidth
                disabled={passwordLoading}
              />
              <TextField
                label="Yeni Şifre"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                fullWidth
                disabled={passwordLoading}
              />
              <TextField
                label="Yeni Şifre Tekrar"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                fullWidth
                disabled={passwordLoading}
              />
              {passwordError && (
                <Typography sx={{ color: "#dc2626", fontSize: "0.85rem" }}>{passwordError}</Typography>
              )}
              {passwordMessage && (
                <Typography sx={{ color: "#16a34a", fontSize: "0.85rem" }}>{passwordMessage}</Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={passwordLoading}
                sx={{ bgcolor: "#002D62", "&:hover": { bgcolor: "#001f44" }, textTransform: "none", fontWeight: 700 }}
              >
                {passwordLoading ? "Güncelleniyor..." : "Şifreyi Değiştir"}
              </Button>
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800, mb: 1.5 }}>Firma Yönetimi</Typography>
            <Box component="form" onSubmit={handleAddCompany} sx={{ display: "grid", gap: 2, mb: 2 }}>
              <TextField
                label="Firma Adı"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                disabled={companyLoading}
                fullWidth
              />
              <TextField
                label="Yetkili Kişi"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                disabled={companyLoading}
                fullWidth
              />
              <TextField
                label="E-posta"
                type="email"
                value={companyEmail}
                onChange={(event) => setCompanyEmail(event.target.value)}
                disabled={companyLoading}
                fullWidth
              />
              <TextField
                label="Başlangıç Şifresi"
                type="password"
                value={companyPassword}
                onChange={(event) => setCompanyPassword(event.target.value)}
                disabled={companyLoading}
                fullWidth
              />
              {companyMessage && (
                <Typography sx={{ color: "#285943", fontSize: "0.85rem" }}>{companyMessage}</Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={companyLoading}
                sx={{ bgcolor: "#002D62", "&:hover": { bgcolor: "#001f44" }, textTransform: "none", fontWeight: 700 }}
              >
                {companyLoading ? "Kaydediliyor..." : "Firma Ekle"}
              </Button>
            </Box>

            {companies.length > 0 ? (
              <Box sx={{ display: "grid", gap: 1 }}>
                {companies.map((company) => (
                  <Paper key={company.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{company.companyName}</Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>{company.email}</Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteCompany(company.id)}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                      >
                        Firma Sil
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>Henüz kayıtlı firma yok.</Typography>
            )}
          </Paper>
        </Box>
      </Paper>
    </AdminPageShell>
  );
}
