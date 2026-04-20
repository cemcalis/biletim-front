"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Box, Button, Container, Paper, Typography } from "@mui/material";
import UserNavbar from "@/components/user-navbar";
import { CorporateFooter } from "@/components/corporate-footer";
import { apiGet } from "@/lib/api";
import { clearStoredUser, getStoredUser, isAuthenticated } from "@/lib/session";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  isCompany: boolean;
  createdAt: string;
};

export default function MyAccountPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated()) {
        window.location.href = "/login";
        return;
      }

      try {
        const user = await apiGet<UserProfile>("/users/me");
        setProfile(user);
      } catch {
        clearStoredUser();
        setError("Oturumunuz gecersiz veya suresi dolmus. Lutfen tekrar giris yapin.");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  const fallback = getStoredUser();
  const displayName = profile?.name || fallback.name || "Kullanici";
  const displayEmail = profile?.email || fallback.email || "-";
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("tr-TR")
    : "-";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8f9fa" }}>
      <UserNavbar active="bookings" />

      <Container maxWidth="lg" sx={{ py: 5, flex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: "1px solid #dde4f1",
            boxShadow: "none",
            background: "rgba(255,255,255,0.92)",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.03em" }}>
            Hesabim
          </Typography>

          {loading && (
            <Typography sx={{ mt: 2, color: "#64748b" }}>
              Hesap bilgileri yukleniyor...
            </Typography>
          )}

          {!loading && error && (
            <Box sx={{ mt: 3, p: 2, border: "1px solid #fecaca", bgcolor: "#fff1f2", borderRadius: 2 }}>
              <Typography sx={{ color: "#9f1239", fontSize: "0.95rem" }}>{error}</Typography>
              <Button
                component={Link}
                href="/login"
                sx={{ mt: 1.5, textTransform: "none", fontWeight: 700, color: "#9f1239" }}
              >
                Giris ekranina don
              </Button>
            </Box>
          )}

          {!loading && !error && (
            <Box sx={{ mt: 3, p: 2.5, border: "1px solid #e2e8f0", borderRadius: 2 }}>
              <Typography sx={{ fontSize: "1rem", color: "#0f172a", fontWeight: 700 }}>
                {displayName}
              </Typography>
              <Typography sx={{ mt: 0.75, color: "#475569" }}>{displayEmail}</Typography>
              <Typography sx={{ mt: 0.75, color: "#64748b", fontSize: "0.9rem" }}>
                Uyelik tarihi: {memberSince}
              </Typography>
              <Typography sx={{ mt: 2, fontSize: "0.92rem", color: "#475569" }}>
                Buradan hesap bilgilerinizi goruntuleyebilirsiniz.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>

      <CorporateFooter />
    </Box>
  );
}
