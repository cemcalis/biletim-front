"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SaveIcon from "@mui/icons-material/Save";
import LogoutIcon from "@mui/icons-material/Logout";
import UserNavbar from "@/components/user-navbar";
import { CorporateFooter } from "@/components/corporate-footer";
import { apiGet, apiRequest } from "@/lib/api";
import { clearStoredUser, getStoredUser, isAuthenticated, setStoredUser } from "@/lib/session";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isCompany: boolean;
  createdAt: string;
  updatedAt?: string;
};

type AlertState = {
  kind: "success" | "error";
  message: string;
};

export default function MyAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alert, setAlert] = useState<AlertState | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated()) {
        router.replace("/login");
        return;
      }

      try {
        const user = await apiGet<UserProfile>("/users/me");
        setProfile(user);
        setName(user.name || "");
        setPhone(user.phone ?? "");
      } catch {
        clearStoredUser();
        setAlert({
          kind: "error",
          message: "Oturumunuz gecersiz veya suresi dolmus. Lutfen tekrar giris yapin.",
        });
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [router]);

  const fallbackUser = getStoredUser();
  const displayName = profile?.name || fallbackUser.name || "Kullanici";
  const displayEmail = profile?.email || fallbackUser.email || "-";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("tr-TR")
    : "-";

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlert(null);

    const normalizedPhone = phone.replace(/\s+/g, "").trim();
    if (!name.trim()) {
      setAlert({ kind: "error", message: "Ad soyad bos olamaz." });
      return;
    }

    if (normalizedPhone && !/^\+?[0-9]{10,15}$/.test(normalizedPhone)) {
      setAlert({ kind: "error", message: "Telefon numarasi gecerli olmali." });
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await apiRequest<UserProfile>("/users/me", "PATCH", {
        name: name.trim(),
        phone: normalizedPhone || undefined,
      });
      setProfile(updated);
      setStoredUser(updated.name, updated.email);
      setAlert({ kind: "success", message: "Profiliniz guncellendi." });
    } catch (error) {
      setAlert({
        kind: "error",
        message: error instanceof Error ? error.message : "Profil guncellenemedi. Lutfen tekrar deneyin.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlert(null);

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setAlert({ kind: "error", message: "Sifre degistirmek icin tum alanlari doldurun." });
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(newPassword)) {
      setAlert({
        kind: "error",
        message: "Yeni sifre en az 8 karakter olmali ve harf ile rakam icermelidir.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({ kind: "error", message: "Yeni sifre ve tekrari eslesmiyor." });
      return;
    }

    setSavingPassword(true);
    try {
      await apiRequest<{ ok: boolean; message: string }>("/users/me/password", "PATCH", {
        currentPassword,
        newPassword,
      });
      clearStoredUser();
      setAlert({
        kind: "success",
        message: "Sifreniz guncellendi. Guvenlik icin giris ekranina yonlendiriliyorsunuz.",
      });
      router.replace("/login");
    } catch (error) {
      setAlert({
        kind: "error",
        message: error instanceof Error ? error.message : "Sifre guncellenemedi. Lutfen tekrar deneyin.",
      });
    } finally {
      setSavingPassword(false);
    }
  }

  function handleLogout() {
    clearStoredUser();
    router.push("/login");
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f6f8fc" }}>
        <UserNavbar active="my-account" />
        <Container sx={{ flex: 1, py: 6 }}>
          <Typography sx={{ color: "#64748b" }}>Hesap bilgileri yukleniyor...</Typography>
        </Container>
        <CorporateFooter />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f6f8fc" }}>
      <UserNavbar active="my-account" />

      <Container maxWidth="lg" sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            mb: 4,
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            color: "#ffffff",
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #334155 100%)",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.24)",
          }}
        >
          <Stack spacing={1.25}>
            <Typography variant="overline" sx={{ letterSpacing: "0.18em", color: "#cbd5e1" }}>
              Hesap Merkezi
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: "-0.04em" }}>
              Hesabim
            </Typography>
            <Typography sx={{ maxWidth: 720, color: "#e2e8f0" }}>
              Profil bilgilerinizi guncelleyin, sifrenizi degistirin ve hesap durumunuzu yonetin.
            </Typography>
          </Stack>
        </Box>

        {alert && (
          <Snackbar
            open
            onClose={() => setAlert(null)}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity={alert.kind} sx={{ width: "100%" }}>
              {alert.message}
            </Alert>
          </Snackbar>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 4, height: "100%" }}>
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 84,
                    height: 84,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "#0f172a",
                    fontSize: "2rem",
                    fontWeight: 800,
                  }}
                >
                  {displayName.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  {displayName}
                </Typography>
                <Typography sx={{ color: "#64748b", mb: 2 }}>
                  {profile?.isCompany ? "Kurumsal Hesap" : "Bireysel Hesap"}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1.25} sx={{ textAlign: "left" }}>
                  <Box>
                    <Typography sx={{ color: "#94a3b8", fontSize: "0.78rem" }}>E-posta</Typography>
                    <Typography sx={{ color: "#0f172a", fontWeight: 600 }}>{displayEmail}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#94a3b8", fontSize: "0.78rem" }}>Uyelik tarihi</Typography>
                    <Typography sx={{ color: "#0f172a", fontWeight: 600 }}>{memberSince}</Typography>
                  </Box>
                </Stack>
                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  sx={{ mt: 3, textTransform: "none", fontWeight: 700 }}
                  fullWidth
                >
                  Cikis Yap
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  border: "1px solid #e2e8f0",
                  borderRadius: 4,
                  boxShadow: "none",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                  Profil Bilgileri
                </Typography>
                <Typography sx={{ color: "#64748b", mb: 3 }}>
                  Ad ve telefon bilgilerinizi burada guncelleyebilirsiniz.
                </Typography>

                <Box component="form" onSubmit={(event) => void handleProfileSubmit(event)}>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Ad Soyad"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={savingProfile}
                        slotProps={{
                          input: {
                            startAdornment: <PersonOutlineOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} />,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="E-posta Adresi"
                        value={displayEmail}
                        disabled
                        slotProps={{
                          input: {
                            startAdornment: <EmailOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} />,
                          },
                        }}
                        helperText="E-posta adresi degistirilemez."
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Telefon Numarasi"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        disabled={savingProfile}
                        placeholder="+905XXXXXXXXX"
                        slotProps={{
                          input: {
                            startAdornment: <PhoneOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} />,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={savingProfile}
                      startIcon={<SaveIcon />}
                      sx={{
                        bgcolor: "#0f172a",
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3,
                        "&:hover": { bgcolor: "#1e293b" },
                      }}
                    >
                      {savingProfile ? "Kaydediliyor..." : "Degisiklikleri Kaydet"}
                    </Button>
                  </Box>
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  border: "1px solid #e2e8f0",
                  borderRadius: 4,
                  boxShadow: "none",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                  Sifre Degistir
                </Typography>
                <Typography sx={{ color: "#64748b", mb: 3 }}>
                  Hesabinizin guvenligini korumak icin sifrenizi guncelleyebilirsiniz.
                </Typography>

                <Box component="form" onSubmit={(event) => void handlePasswordSubmit(event)}>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Mevcut Sifre"
                        type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        disabled={savingPassword}
                        slotProps={{
                          input: {
                            startAdornment: <LockOutlinedIcon sx={{ mr: 1, color: "#94a3b8" }} />,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Yeni Sifre"
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        disabled={savingPassword}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Yeni Sifre (Tekrar)"
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        disabled={savingPassword}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={savingPassword}
                      sx={{
                        bgcolor: "#0f766e",
                        textTransform: "none",
                        fontWeight: 700,
                        px: 3,
                        "&:hover": { bgcolor: "#115e59" },
                      }}
                    >
                      {savingPassword ? "Guncelleniyor..." : "Sifreyi Guncelle"}
                    </Button>
                    <Button
                      component={Link}
                      href="/my-bookings"
                      variant="text"
                      sx={{ textTransform: "none", fontWeight: 700, color: "#0f172a" }}
                    >
                      Rezervasyonlarima Git
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <CorporateFooter />
    </Box>
  );
}