"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import UserNavbar from "@/components/user-navbar";
import { setStoredUser } from "@/lib/session";
import { apiRequest } from "@/lib/api";

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
      const response = await apiRequest<LoginResponse>("/auth/login", "POST", {
        email,
        password,
      });

      setStoredUser(response.user.name, response.user.email, response.access_token);
      router.push("/my-bookings");
    } catch (err) {
      setError("Giriş başarısız oldu. E-posta veya şifrenizi kontrol edin.");
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fa", color: "#12203a" }}>
      <UserNavbar active="home" />
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: "1px solid #dce3f1", boxShadow: "none" }}>
          <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Giriş</Typography>
          <Typography sx={{ mt: 1, fontSize: "0.9rem", color: "#5b6b87" }}>Hesabınıza giriş yapın.</Typography>

          <Box component="form" onSubmit={onSubmit} sx={{ mt: 3, display: "grid", gap: 1.5 }}>
            {error && (
              <Typography sx={{ fontSize: "0.85rem", color: "#d34255", bgcolor: "#fde8eb", p: 1.5, borderRadius: 1 }}>
                {error}
              </Typography>
            )}
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
              placeholder="Şifrenizi girin"
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
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </Box>

          <Typography sx={{ mt: 2.5, fontSize: "0.85rem", color: "#5b6b87" }}>
            Hesabınız yok mu?{" "}
            <Box
              component="a"
              href="/register"
              sx={{
                color: "#2a64e8",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Kayıt olun
            </Box>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
