"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import UserNavbar from "@/components/user-navbar";
import { CorporateFooter } from "@/components/corporate-footer";
import { apiRequest } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Sıfırlama tokeni bulunamadı. Lütfen bağlantıyı kontrol edin.');
    }
  }, [token]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError('Geçersiz veya eksik token.');
      return;
    }
    if (!password.trim() || !confirmPassword.trim()) {
      setError('Lütfen yeni şifrenizi girin.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);

    try {
      await apiRequest('/auth/reset', 'POST', { token, password });
      setMessage('Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz.');
      setTimeout(() => router.push('/login'), 1500);
    } catch {
      setError('Şifre sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa' }}>
      <UserNavbar active='home' />
      <Container maxWidth='sm' sx={{ py: 8, flex: 1 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 5 }, border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', mb: 1.5 }}>
            Şifre Sıfırlama
          </Typography>
          <Typography sx={{ color: '#64748b', mb: 3 }}>
            Lütfen yeni şifrenizi oluşturun. Bu işlemden sonra tekrar giriş yapabilirsiniz.
          </Typography>

          <Box component='form' onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Box sx={{ p: 1.5, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 1 }}>
                <Typography sx={{ fontSize: '0.85rem', color: '#dc2626' }}>{error}</Typography>
              </Box>
            )}
            {message && (
              <Box sx={{ p: 1.5, bgcolor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 1 }}>
                <Typography sx={{ fontSize: '0.85rem', color: '#166534' }}>{message}</Typography>
              </Box>
            )}

            <TextField
              label='Yeni Şifre'
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              fullWidth
              autoComplete='new-password'
              autoFocus
            />
            <TextField
              label='Yeni Şifre Tekrar'
              type='password'
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={loading}
              fullWidth
            />
            <Button
              type='submit'
              variant='contained'
              disabled={loading || !token}
              sx={{
                mt: 1,
                height: 48,
                bgcolor: '#002D62',
                '&:hover': { bgcolor: '#001f44' },
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
              }}
            >
              {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </Button>
          </Box>
        </Paper>
      </Container>
      <CorporateFooter />
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }} />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
