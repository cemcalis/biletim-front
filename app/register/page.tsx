"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Container, Divider, Paper, TextField, Typography } from "@mui/material";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import UserNavbar from "@/components/user-navbar";
import { CorporateFooter } from "@/components/corporate-footer";
import { setStoredUser } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { handleGoogleAuth } from "@/lib/google-auth";

interface RegisterResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Lütfen tüm alanları doldurunuz.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<RegisterResponse>("/auth/register", "POST", { name, email, password });
      setStoredUser(response.user.name, response.user.email, response.access_token);
      router.push("/my-bookings");
    } catch {
      setError("Kayıt işlemi başarısız. Bilgilerinizi kontrol edin.");
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
              <PersonAddOutlinedIcon sx={{ color: "#ffffff", fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                Yeni Hesap Oluşturun
              </Typography>
              <Typography sx={{ fontSize: "0.82rem", color: "#64748b" }}>
                Near East Way
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
            <TextField
              label="Ad Soyad"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              fullWidth
              autoFocus
            />
            <TextField
              label="E-posta Adresi"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              fullWidth
              autoComplete="new-password"
            />
            <TextField
              label="Şifre Tekrar"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              fullWidth
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
              {loading ? "Kaydediliyor..." : "Kayıt Ol"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <GoogleLogin
            onSuccess={async (credentialResponse: CredentialResponse) => {
              setError("");
              setLoading(true);
              try {
                if (!credentialResponse.credential) {
                  throw new Error('Google token alınamadı');
                }
                await handleGoogleAuth(credentialResponse.credential);
                router.push('/my-bookings');
              } catch (err) {
                setError('Google ile kayıt başarısız oldu. Lütfen tekrar deneyin.');
              } finally {
                setLoading(false);
              }
            }}
            onError={() => {
              setError('Google kimlik doğrulama sırasında bir hata oluştu.');
            }}
          />

          <Typography sx={{ mt: 3, fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
            Zaten hesabınız var mı?{" "}
            <Box component={Link} href="/login" sx={{ color: "#002D62", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Giriş Yapın
            </Box>
          </Typography>
        </Paper>
      </Container>
      <CorporateFooter />
    </Box>
  );
}