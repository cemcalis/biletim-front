"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Paper,
  Popover,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { clearStoredUser, getStoredUser, setStoredUser } from "../lib/session";

type UserNavbarProps = {
  active: "home" | "search" | "track" | "bookings" | "admin";
};

const navItems = [
  { label: "Ana Sayfa", href: "/", key: "home" as const },
  { label: "Otobüs Ara", href: "/search-buses", key: "search" as const },
  { label: "Sefer Takibi", href: "/track-bus", key: "track" as const },
  { label: "Rezervasyonlarım", href: "/my-bookings", key: "bookings" as const },
];

export default function UserNavbar({ active }: UserNavbarProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [profileInfo, setProfileInfo] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    const nextName = user.name.trim();
    const nextEmail = user.email.trim();
    setName(nextName);
    setEmail(nextEmail);
    setDisplayName(nextName);
    setFormName(nextName);
    setFormEmail(nextEmail);
  }, []);

  function onSaveProfile() {
    const nextName = formName.trim();
    const nextEmail = formEmail.trim();
    if (!nextName || !nextEmail) {
      setProfileInfo("Ad soyad ve e-posta zorunludur.");
      return;
    }

    setStoredUser(nextName, nextEmail);
    setName(nextName);
    setEmail(nextEmail);
    setDisplayName(nextName);
    setProfileInfo("Bilgileriniz güncellendi.");
  }

  function onLogout() {
    clearStoredUser();
    setName("");
    setEmail("");
    setDisplayName("");
    setFormName("");
    setFormEmail("");
    setProfileInfo("");
    setAnchorEl(null);
  }

  function openProfileMenu(event: MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function closeProfileMenu() {
    setAnchorEl(null);
  }

  const popoverOpen = Boolean(anchorEl);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ bgcolor: "#fff", color: "#102040", borderBottom: "1px solid #e3e8f1" }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 } }}>
        <Toolbar disableGutters sx={{ minHeight: 60, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Box
              component={Link}
              href="/"
              sx={{ display: "flex", alignItems: "center", gap: 1, color: "inherit", textDecoration: "none" }}
            >
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#2b68ff" }} />
              <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>Near East Ulaşım</Typography>
            </Box>

            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.75 }}>
              {navItems.map((item) => {
                const isActive = active === item.key;
                return (
                  <Button
                    key={item.key}
                    component={Link}
                    href={item.href}
                    disableRipple
                    variant="text"
                    sx={{
                      minWidth: "auto",
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1,
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      textTransform: "none",
                      color: isActive ? "#2a63e8" : "#30405c",
                      bgcolor: isActive ? "#eaf0ff" : "transparent",
                      boxShadow: "none",
                      "&:hover": { bgcolor: isActive ? "#eaf0ff" : "#f2f5fa" },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {displayName ? (
              <Button
                onClick={openProfileMenu}
                variant="text"
                disableRipple
                sx={{
                  minWidth: "auto",
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 1,
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: "#24324f",
                  textTransform: "none",
                  boxShadow: "none",
                }}
              >
                {displayName}
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/login"
                  variant="text"
                  disableRipple
                  sx={{ minWidth: "auto", px: 1.25, py: 0.75, fontSize: "0.8rem", textTransform: "none", color: "#24324f", boxShadow: "none" }}
                >
                  Giriş
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="text"
                  disableRipple
                  sx={{ minWidth: "auto", px: 1.25, py: 0.75, fontSize: "0.8rem", textTransform: "none", color: "#24324f", boxShadow: "none" }}
                >
                  Kayıt Ol
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={closeProfileMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { mt: 1, width: 300, border: "1px solid #d8deec", boxShadow: "none" } } }}
      >
        <Paper elevation={0} sx={{ p: 2, boxShadow: "none" }}>
          <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2640" }}>Kişisel Bilgiler</Typography>
          <Typography sx={{ mt: 0.5, fontSize: "0.78rem", color: "#5f6d88" }}>
            Adınıza tıklayarak bilgilerinizi güncelleyebilirsiniz.
          </Typography>

          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
            <TextField size="small" value={formName} onChange={(event) => setFormName(event.target.value)} placeholder="Örn: Cem Çalış" label="Ad Soyad" />
            <TextField size="small" value={formEmail} onChange={(event) => setFormEmail(event.target.value)} placeholder="Örn: cem@example.com" label="E-posta" />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={onSaveProfile} variant="contained" disableElevation sx={{ fontSize: "0.75rem", textTransform: "none", bgcolor: "#2a64e8", boxShadow: "none" }}>
                Kaydet
              </Button>
              <Button onClick={onLogout} variant="outlined" sx={{ fontSize: "0.75rem", textTransform: "none", borderColor: "#f0c5cc", color: "#d34255", boxShadow: "none" }}>
                Çıkış Yap
              </Button>
            </Box>
            {profileInfo ? <Typography sx={{ fontSize: "0.75rem", color: "#2a64e8" }}>{profileInfo}</Typography> : null}
            {name && email ? <Typography sx={{ fontSize: "0.72rem", color: "#6a7894" }}>{email}</Typography> : null}
          </Box>
        </Paper>
      </Popover>
    </AppBar>
  );
}
