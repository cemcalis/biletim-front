"use client";

import { Box, Button, Container, Paper, Typography, TextField } from "@mui/material";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import UserNavbar from "@/components/user-navbar";
import { setStoredUser } from "@/lib/session";
import { apiRequest } from "@/lib/api";

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
      setError("Şifre en az 6 karakterden oluşmalıdır.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest<RegisterResponse>("/auth/register", "POST", {
        name,
        email,
        password,
      });

      setStoredUser(response.user.name, response.user.email, response.access_token);
      router.push("/my-bookings");
    } catch (err) {
      setError("Kayıt işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.");
      console.error("Registration failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fa", color: "#12203a" }}>
      <UserNavbar active="home" />
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: "1px solid #dce3f1", boxShadow: "none" }}>
          <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Kayıt</Typography>
          <Typography sx={{ mt: 1, fontSize: "0.9rem", color: "#5b6b87" }}>Yeni hesap oluşturmak için bilgilerinizi girin.</Typography>

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 3, display: "grid", gap: 1.5 }}>
            {error && (
              <Typography sx={{ fontSize: "0.85rem", color: "#d34255", bgcolor: "#fde8eb", p: 1.5, borderRadius: 1 }}>
                {error}
              </Typography>
            )}
            <TextField
              size="small"
              value={name}
              onChange={(event) => setName(event.target.value)}
              label="Ad Soyad"
              placeholder="Örn: Cem Çalış"
              disabled={loading}
            />
            <TextField
              size="small"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              label="E-posta"
              placeholder="Örn: cem@example.com"
              type="email"
              disabled={loading}
            />
            <TextField
              size="small"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              label="Şifre"
              placeholder="En az 6 karakter"
              type="password"
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              disableElevation
              disabled={loading}
              sx={{
                alignSelf: "start",
                textTransform: "none",
                bgcolor: "#2a64e8",
                boxShadow: "none",
                "&:disabled": { bgcolor: "#a0c4ff", color: "#fff" },
              }}
            >
              {loading ? "Kaydediliyor..." : "Kayıt Ol"}
            </Button>
          </Box>

          <Typography sx={{ mt: 2.5, fontSize: "0.85rem", color: "#5b6b87" }}>
            Zaten hesabınız var mı?{" "}
            <Box
              component="a"
              href="/login"
              sx={{
                color: "#2a64e8",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Giriş yapın
            </Box>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}