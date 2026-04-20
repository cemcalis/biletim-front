"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Box, Button, Container, Divider, Paper, TextField, Typography } from "@mui/material";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import UserNavbar from "@/components/user-navbar";
import { CorporateFooter } from "@/components/corporate-footer";
import { apiRequest } from "@/lib/api";

type CompanyRegisterResponse = {
  ok: boolean;
  message?: string;
};

export default function CompanyRegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!companyName.trim() || !contactName.trim() || !email.trim() || !password.trim()) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest<CompanyRegisterResponse>("/company/register", "POST", {
        companyName,
        contactName,
        email,
        password,
      });

      if (!response.ok) {
        setError(response.message ?? "Başvuru oluşturulamadı.");
        return;
      }

      setSuccess(response.message ?? "Başvurunuz alındı. Admin onayı sonrası giriş yapabilirsiniz.");
      setCompanyName("");
      setContactName("");
      setEmail("");
      setPassword("");
    } catch {
      setError("Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8f9fa" }}>
      <UserNavbar active="home" />

      <Container maxWidth="sm" sx={{ py: 8, flex: 1 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: "1px solid #e2e8f0", borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: "#002D62", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BusinessRoundedIcon sx={{ color: "#ffffff", fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                Firma Başvurusu
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", color: "#64748b" }}>
                Near East Way İş Ortağı Kaydı
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Box sx={{ p: 1.5, bgcolor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#dc2626" }}>{error}</Typography>
              </Box>
            )}
            {success && (
              <Box sx={{ p: 1.5, bgcolor: "#ecfdf5", border: "1px solid #86efac", borderRadius: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#166534" }}>{success}</Typography>
              </Box>
            )}

            <TextField
              label="Firma Adı"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              disabled={loading}
              fullWidth
              autoFocus
            />
            <TextField
              label="Yetkili Ad Soyad"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              disabled={loading}
              fullWidth
            />
            <TextField
              label="E-posta"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Şifre"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              fullWidth
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                height: 48,
                bgcolor: "#002D62",
                "&:hover": { bgcolor: "#001f44" },
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              {loading ? "Başvuru Gönderiliyor..." : "Başvuruyu Gönder"}
            </Button>
          </Box>

          <Typography sx={{ mt: 3, fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
            Zaten onaylı firma hesabınız var mı?{" "}
            <Box component={Link} href="/admin" sx={{ color: "#002D62", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Yönetim Girişi
            </Box>
          </Typography>
        </Paper>
      </Container>

      <CorporateFooter />
    </Box>
  );
}
