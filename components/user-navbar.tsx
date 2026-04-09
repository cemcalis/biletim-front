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
  { label: "Sefer Sorgulama", href: "/search-buses", key: "search" as const },
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
      setProfileInfo("Lütfen tüm alanları doldurunuz.");
      return;
    }
    setStoredUser(nextName, nextEmail);
    setName(nextName);
    setEmail(nextEmail);
    setDisplayName(nextName);
    setProfileInfo("Bilgileriniz başarıyla güncellendi.");
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
        bgcolor: isHero ? "transparent" : "#ffffff",
        color: isHero ? "#ffffff" : "#0f172a",
        borderBottom: isHero ? "none" : "1px solid #e2e8f0",
        boxShadow: "none",
        zIndex: 12,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4 } }}>
        <Toolbar disableGutters sx={{ minHeight: isHero ? 80 : 68, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Box
              component={Link}
              href="/"
              sx={{ display: "flex", alignItems: "center", gap: 1.5, color: "inherit", textDecoration: "none" }}
            >
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  bgcolor: "#D4AF37",
                  borderRadius: "3px",
                }}
              />
              <Typography
                sx={{
                  fontFamily: "var(--font-display), 'Playfair Display', serif",
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                }}
              >
                BİLETİM A.Ş.
              </Typography>
            </Box>

            <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 0.5 }}>
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
                      px: 1.5,
                      py: 0.75,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      textTransform: "none",
                      letterSpacing: "0.01em",
                      color: isHero
                        ? isActive ? "#D4AF37" : "#ffffff"
                        : isActive ? "#002D62" : "#64748b",
                      bgcolor: isActive && !isHero ? "#f1f5f9" : "transparent",
                      boxShadow: "none",
                      borderRadius: "4px",
                      "&:hover": {
                        bgcolor: isHero ? "rgba(255,255,255,0.1)" : "#f1f5f9",
                        color: isHero ? "#ffffff" : "#0f172a",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {displayName ? (
              <Button
                onClick={openProfileMenu}
                variant="outlined"
                disableRipple
                sx={{
                  px: 2,
                  py: 0.75,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textTransform: "none",
                  color: isHero ? "#ffffff" : "#002D62",
                  borderColor: isHero ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                  borderRadius: "4px",
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: isHero ? "#ffffff" : "#002D62",
                    bgcolor: "transparent",
                  },
                }}
              >
                {displayName}
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/login"
                  variant="outlined"
                  disableRipple
                  sx={{
                    px: 2,
                    py: 0.75,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textTransform: "none",
                    color: isHero ? "#ffffff" : "#002D62",
                    borderColor: isHero ? "rgba(255,255,255,0.3)" : "#e2e8f0",
                    borderRadius: "4px",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: isHero ? "#ffffff" : "#002D62",
                      bgcolor: "transparent",
                    },
                  }}
                >
                  Giriş Yap
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  disableRipple
                  sx={{
                    display: { xs: "none", md: "inline-flex" },
                    px: 2,
                    py: 0.75,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textTransform: "none",
                    bgcolor: isHero ? "#ffffff" : "#002D62",
                    color: isHero ? "#002D62" : "#ffffff",
                    borderRadius: "4px",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: isHero ? "#f0f0f0" : "#001f44",
                    },
                  }}
                >
                  Kayıt Ol
                </Button>
              </>
            )}
            <IconButton
              size="small"
              sx={{ color: isHero ? "#fff" : "#64748b", display: { xs: "inline-flex", lg: "none" } }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={closeProfileMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: 300,
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.1)",
              borderRadius: 2,
            },
          },
        }}
      >
        <Paper elevation={0} sx={{ p: 3 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
            Kullanıcı Profili
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "#64748b", mb: 3 }}>
            {email}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <TextField
              variant="outlined"
              size="small"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              label="Ad Soyad"
              fullWidth
            />
            <TextField
              variant="outlined"
              size="small"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              label="E-Posta"
              type="email"
              fullWidth
            />
            {profileInfo && (
              <Typography sx={{ fontSize: "0.8rem", color: "#059669", fontWeight: 500 }}>
                {profileInfo}
              </Typography>
            )}
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              <Button
                onClick={onSaveProfile}
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#002D62",
                  "&:hover": { bgcolor: "#001f44" },
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                Kaydet
              </Button>
              <Button
                onClick={onLogout}
                variant="outlined"
                color="error"
                sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.85rem", borderRadius: "4px" }}
              >
                Çıkış
              </Button>
            </Box>
          </Box>
        </Paper>
      </Popover>
    </AppBar>
  );
}
