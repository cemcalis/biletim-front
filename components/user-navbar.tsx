"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Popover,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { clearStoredUser, getStoredUser, setStoredUser } from "../lib/session";

type UserNavbarProps = {
  active: "home" | "search" | "track" | "bookings" | "admin";
  variant?: "default" | "hero";
};

const navItems = [
  { label: "Ana Sayfa", href: "/", key: "home" as const },
  { label: "Otobüs Ara", href: "/search-buses", key: "search" as const },
  { label: "Kampanyalar", href: "/campaigns", key: "campaigns" as const },
  { label: "Sefer Takibi", href: "/track-bus", key: "track" as const },
  { label: "Rezervasyonlarım", href: "/my-bookings", key: "bookings" as const },
];

export default function UserNavbar({ active, variant = "default" }: UserNavbarProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [profileInfo, setProfileInfo] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    const nextName = stored.name.trim();
    const nextEmail = stored.email.trim();
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
  const isHero = variant === "hero";

  return (
    <AppBar
      position={isHero ? "absolute" : "sticky"}
      elevation={0}
      sx={{
        bgcolor: isHero ? "transparent" : "#fff",
        color: isHero ? "#fff" : "#102040",
        borderBottom: isHero ? "none" : "1px solid #e3e8f1",
        boxShadow: "none",
        zIndex: 12,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 } }}>
        <Toolbar disableGutters sx={{ minHeight: isHero ? 72 : 60, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Box
              component={Link}
              href="/"
              sx={{ display: "flex", alignItems: "center", gap: 1, color: "inherit", textDecoration: "none" }}
            >
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: isHero ? "#4ed5ff" : "#2b68ff" }} />
              <Typography sx={{ fontSize: isHero ? "1.05rem" : "0.95rem", fontWeight: 800, letterSpacing: isHero ? "0.02em" : "normal" }}>
                Near East
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", lg: "flex" }, gap: isHero ? 0.5 : 0.75 }}>
              {(isHero
                ? [
                    { label: "Otobüs", href: "/search-buses", key: "search" as const },
                    { label: "Kampanyalar", href: "/campaigns", key: "campaigns" as const },
                  ]
                : navItems
              ).map((item) => {
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
                      px: isHero ? 0.9 : 1.25,
                      py: isHero ? 0.55 : 0.75,
                      borderRadius: 1,
                      fontSize: isHero ? "0.78rem" : "0.8rem",
                      fontWeight: isHero ? 600 : 500,
                      textTransform: "none",
                      color: isHero ? "#eef6ff" : isActive ? "#2a63e8" : "#30405c",
                      bgcolor: isHero ? "transparent" : isActive ? "#eaf0ff" : "transparent",
                      boxShadow: "none",
                      "&:hover": { bgcolor: isHero ? "#2b4a89" : isActive ? "#eaf0ff" : "#f2f5fa" },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isHero ? (
              <>
              </>
            ) : null}

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
                  color: isHero ? "#fff" : "#24324f",
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
                  sx={{
                    minWidth: "auto",
                    px: isHero ? 2 : 1.25,
                    py: isHero ? 0.5 : 0.75,
                    fontSize: "0.8rem",
                    textTransform: "none",
                    color: isHero ? "#fff" : "#24324f",
                    border: isHero ? "1px solid rgba(255,255,255,0.7)" : "none",
                    borderRadius: isHero ? 999 : 1,
                    boxShadow: "none",
                  }}
                >
                  Giriş
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="text"
                  disableRipple
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    minWidth: "auto",
                    px: 1.25,
                    py: 0.75,
                    fontSize: "0.8rem",
                    textTransform: "none",
                    color: isHero ? "#e9f3ff" : "#24324f",
                    boxShadow: "none",
                  }}
                >
                  Kayıt Ol
                </Button>
              </>
            )}
            {isHero ? (
              <IconButton size="small" sx={{ color: "#fff", ml: 0.25, display: { xs: "inline-flex", lg: "none" } }}>
                <MenuRoundedIcon />
              </IconButton>
            ) : null}
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
              <Button onClick={onSaveProfile} variant="contained" disableElevation sx={{ fontSize: "0.75rem", textTransform: "none", bgcolor: "#1f3971", boxShadow: "none", "&:hover": { bgcolor: "#264a90" } }}>
                Kaydet
              </Button>
              <Button onClick={onLogout} variant="outlined" sx={{ fontSize: "0.75rem", textTransform: "none", borderColor: "#f0c5cc", color: "#d34255", boxShadow: "none" }}>
                Çıkış Yap
              </Button>
            </Box>
            {profileInfo ? <Typography sx={{ fontSize: "0.75rem", color: "#1f3971" }}>{profileInfo}</Typography> : null}
            {name && email ? <Typography sx={{ fontSize: "0.72rem", color: "#6a7894" }}>{email}</Typography> : null}
          </Box>
        </Paper>
      </Popover>
    </AppBar>
  );
}
