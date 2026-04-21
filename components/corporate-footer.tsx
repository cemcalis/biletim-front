"use client";

import Link from "next/link";
import { Box, Container, Divider, Typography } from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const CORPORATE_LINKS = [
  { label: "Hakkımızda", href: "/about" },
  { label: "Filomuz", href: "/fleet" },
  { label: "Kalite Politikamız", href: "/quality" },
];

const SERVICE_LINKS = [
  { label: "Sefer Sorgulama", href: "/search-buses" },
  { label: "Rezervasyonlarım", href: "/my-bookings" },
  { label: "Bize Ulaşın", href: "/support" },
];

const LEGAL_LINKS = [
  { label: "Gizlilik Politikası", href: "/privacy" },
  { label: "Kullanım Şartları", href: "/terms" },
  { label: "KVKK", href: "/kvkk" },
];

const linkSx = {
  color: "rgba(255,255,255,0.55)",
  textDecoration: "none",
  fontSize: "0.875rem",
  lineHeight: 1.6,
  transition: "color 0.15s",
  "&:hover": { color: "#D4AF37" },
  display: "block",
};

export function CorporateFooter() {
  return (
    <Box component="footer" sx={{ bgcolor: "#002D62", color: "#ffffff", mt: "auto" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4 } }}>
        <Box
          sx={{
            pt: { xs: 6, md: 8 },
            pb: 5,
            display: "grid",
            gap: 5,
            gridTemplateColumns: { xs: "1fr", sm: "1.5fr 1fr 1fr 1fr" },
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Box sx={{ width: 20, height: 20, bgcolor: "#D4AF37", borderRadius: "3px" }} />
              <Typography
                sx={{
                  fontFamily: "var(--font-display), 'Playfair Display', serif",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                Near East Way
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.55)",
                lineHeight: 1.75,
                maxWidth: 280,
              }}
            >
              Kıbrıs&apos;nin öncü kurumsal otobüs seyahat platformu. Güven, konfor ve profesyonellik.
            </Typography>
            <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneOutlinedIcon sx={{ fontSize: 16, color: "#D4AF37" }} />
                <Typography sx={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)" }}>
                  444 0 000
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailOutlinedIcon sx={{ fontSize: 16, color: "#D4AF37" }} />
                <Typography sx={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)" }}>
                  info@neareastway.com.tr
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <LocationOnOutlinedIcon sx={{ fontSize: 16, color: "#D4AF37", mt: "2px", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                  Near east bank 
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
              Kurumsal
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {CORPORATE_LINKS.map((link) => (
                <Typography key={link.href} component={Link} href={link.href} sx={linkSx}>
                  {link.label}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
              Hizmetler
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {SERVICE_LINKS.map((link) => (
                <Typography key={link.href} component={Link} href={link.href} sx={linkSx}>
                  {link.label}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
              Yasal
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {LEGAL_LINKS.map((link) => (
                <Typography key={link.href} component={Link} href={link.href} sx={linkSx}>
                  {link.label}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <Box
          sx={{
            py: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
            © {new Date().getFullYear()}Near East Way — Tüm hakları saklıdır.
          </Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
            Kıbrıs&apos;da üretilmiş ve barındırılmaktadır.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
