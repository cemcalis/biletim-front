"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Container, Divider, Paper, TextField, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { setStoredUser } from "@/lib/session";
import { apiRequest } from "@/lib/api";
import { hasGoogleClientId } from "@/lib/google-config";
import { handleGoogleAuth } from "@/lib/google-auth";


interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Lütfen e-posta ve şifrenizi girin.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<LoginResponse>("/auth/login", "POST", { email, password });
      setStoredUser(response.user.name, response.user.email, response.access_token);
      router.push("/my-bookings");
    } catch {
      setError("Giriş başarısız. E-posta veya şifrenizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  return (
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: "1px solid #e2e8f0", borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: "#002D62", borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LockOutlinedIcon sx={{ color: "#ffffff", fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                Hesabınıza Giriş Yapın
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
              label="E-posta Adresi"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              fullWidth
              autoComplete="email"
              autoFocus
            />
            <TextField
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              fullWidth
              autoComplete="current-password"
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
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ mb: 1, fontSize: "0.85rem", color: "#475569", textAlign: "center", fontWeight: 700 }}>
            Google ile giriş
          </Typography>

          {hasGoogleClientId() ? (
            <GoogleLogin
              onSuccess={async (credentialResponse: CredentialResponse) => {
                setError("");
                setLoading(true);
                try {
                  if (!credentialResponse.credential) {
                    throw new Error("Google token alınamadı");
                  }
                  await handleGoogleAuth(credentialResponse.credential);
                  router.push("/my-bookings");
                } catch (err: unknown) {
                  // Show specific error message from backend if available
                  const errorMsg =
                    err instanceof Error
                      ? err.message
                      : "Google ile giriş başarısız oldu. Lütfen tekrar deneyin.";
                  setError(errorMsg);
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => {
                setError("Google giriş penceresi kapatıldı veya bir hata oluştu.");
              }}
            />
          ) : (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setError("Google girişi için NEXT_PUBLIC_GOOGLE_CLIENT_ID ayarı eksik.")}
              sx={{ height: 42, textTransform: "none", fontWeight: 700 }}
            >
              Google ile Giriş Yap
            </Button>
          )}

          <Typography sx={{ mt: 3, fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
            Şifrenizi mi unuttunuz?{" "}
            <Box component={Link} href="/forgot-password" sx={{ color: "#002D62", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Şifremi Unuttum
            </Box>
          </Typography>

          <Typography sx={{ mt: 1, fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
            Hesabınız yok mu?{" "}
            <Box component={Link} href="/register" sx={{ color: "#002D62", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Kayıt Olun
            </Box>
          </Typography>

          <Typography sx={{ mt: 1, fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
            Firmanız için iş ortağı başvurusu mu yapmak istiyorsunuz?{" "}
            <Box component={Link} href="/company/register" sx={{ color: "#002D62", fontWeight: 700, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Firma Başvurusu
            </Box>
          </Typography>
        </Paper>
      </Container>
  );
}
