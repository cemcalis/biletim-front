"use client";

import { FormEvent, useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { apiRequest } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!email.trim()) {
      setError("Lütfen e-posta adresinizi giriniz.");
      return;
    }
    setLoading(true);
    try {
      await apiRequest("/auth/forgot", "POST", { email });
      setMessage("Eğer bu e-posta adresi kayıtlıysa, parola sıfırlama bağlantısı gönderildi.");
      setEmail("");
    } catch {
      setError("Şifre sıfırlama talebi gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: "1px solid #e2e8f0", borderRadius: 2 }}>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", mb: 1.5 }}>
            Şifremi Unuttum
          </Typography>
          <Typography sx={{ color: "#64748b", mb: 3 }}>
            Kayıtlı e-posta adresinizi girin. Size parola sıfırlama bağlantısı göndereceğiz.
          </Typography>

          <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Box sx={{ p: 1.5, bgcolor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#dc2626" }}>{error}</Typography>
              </Box>
            )}
            {message && (
              <Box sx={{ p: 1.5, bgcolor: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 1 }}>
                <Typography sx={{ fontSize: "0.85rem", color: "#166534" }}>{message}</Typography>
              </Box>
            )}

            <TextField
              label="E-posta Adresi"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              fullWidth
              autoComplete="email"
              autoFocus
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
              {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
            </Button>
          </Box>
        </Paper>
      </Container>
  );
}
