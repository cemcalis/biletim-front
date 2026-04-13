"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  IconButton,
  Chip,
  InputAdornment,
} from "@mui/material";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";

import { CorporateFooter } from "@/components/corporate-footer";
import UserNavbar from "@/components/user-navbar";
import { apiGet } from "../lib/api";

type RouteSummary = {
  from: string;
  to: string;
  basePrice: number;
  durationMinutes: number;
};

const BENEFITS = [
  {
    icon: <LockOutlinedIcon sx={{ fontSize: 28, color: "#002D62" }} />,
    title: "Güvenli Ödeme",
    desc: "256-bit SSL şifreleme ile tüm işlemleriniz korunur.",
  },
  {
    icon: <SupportAgentOutlinedIcon sx={{ fontSize: 28, color: "#002D62" }} />,
    title: "7/24 Destek",
    desc: "Seyahatinizle ilgili her konuda çağrı merkezimiz yanınızda.",
  },
  {
    icon: <AssignmentReturnOutlinedIcon sx={{ fontSize: 28, color: "#002D62" }} />,
    title: "Kolay İptal ve İade",
    desc: "Satın aldığınız biletlerde sorunsuz iptal ve iade garantisi.",
  },
];

const POPULAR_ROUTES = [
  { from: "İstanbul", to: "Ankara" },
  { from: "Ankara", to: "İstanbul" },
  { from: "İzmir", to: "İstanbul" },
  { from: "İstanbul", to: "İzmir" },
  { from: "Antalya", to: "Ankara" },
  { from: "Bursa", to: "İstanbul" },
  { from: "Adana", to: "İstanbul" },
  { from: "Konya", to: "Ankara" },
  { from: "Trabzon", to: "Ankara" },
];

export default function HomePage() {
  const router = useRouter();
  const getToday = () => new Date().toISOString().slice(0, 10);
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  };

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(getToday());
  const [, setRouteCards] = useState<RouteSummary[]>([]);

  useEffect(() => {
    apiGet<RouteSummary[]>("/routes")
      .then((data) => setRouteCards(data))
      .catch(() => setRouteCards([]));
  }, []);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams({ from, to, date });
    router.push(`/search-buses?${params.toString()}`);
  }

  function handleSwap() {
    const temp = from;
    setFrom(to);
    setTo(temp);
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8f9fa" }}>
      <Box sx={{ bgcolor: "#002D62", color: "#ffffff", pb: { xs: 10, md: 14 } }}>
        <UserNavbar active="home" variant="hero" />
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, pt: { xs: 4, md: 8 } }}>
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: "1.8rem", md: "2.6rem" },
              fontWeight: 800,
              textAlign: "center",
              mb: 1.5,
              color: "#ffffff",
              fontFamily: "var(--font-display), 'Playfair Display', serif",
            }}
          >
            Kıbrıs&apos;nin Lider Otobüs Platformu
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              textAlign: "center",
              color: "#c8d8ea",
              mb: 4,
            }}
          >
            Yüzlerce firmanın seferlerini tek yerden karşılaştır, en uygun biletini al.
          </Typography>

          <Paper
            elevation={0}
            sx={{
              maxWidth: 980,
              mx: "auto",
              p: { xs: 3, md: 4 },
              borderRadius: 2,
              border: "1px solid #e2e8f0",
            }}
          >
            <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <DirectionsBusIcon sx={{position:"sticky", color: "#002D62", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, color: "#002D62", fontSize: "0.95rem" }}>
                Otobüs Bileti
              </Typography>
            </Box>

            <Box component="form" onSubmit={onSearch}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                  alignItems: { xs: "stretch", md: "flex-start" },
                }}
              >
                <TextField
                  variant="outlined"
                  label="Nereden"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  fullWidth
                  placeholder="Kalkış şehri"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <IconButton
                  onClick={handleSwap}
                  sx={{
                    alignSelf: "center",
                    bgcolor: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    color: "#002D62",
                    "&:hover": { bgcolor: "#e2e8f0" },
                    flexShrink: 0,
                  }}
                >
                  <SwapHorizIcon fontSize="small" />
                </IconButton>

                <TextField
                  variant="outlined"
                  label="Nereye"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  fullWidth
                  placeholder="Varış şehri"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ display: "flex", flexDirection: "column", minWidth: { md: 220 } }}>
                    <>
                      <TextField
                        variant="outlined"
                        label="Tarih"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        fullWidth
                        slotProps={{
                          inputLabel: { shrink: true },
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarMonthOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                      <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip
                          label="Bugün"
                          size="small"
                          onClick={() => setDate(getToday())}
                          sx={{
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor: date === getToday() ? "#002D62" : "transparent",
                            color: date === getToday() ? "#fff" : "#64748b",
                            border: "1px solid",
                            borderColor: date === getToday() ? "#002D62" : "#cbd5e1",
                          }}
                        />
                        <Chip
                          label="Yarın"
                          size="small"
                          onClick={() => setDate(getTomorrow())}
                          sx={{
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor: date === getTomorrow() ? "#002D62" : "transparent",
                            color: date === getTomorrow() ? "#fff" : "#64748b",
                            border: "1px solid",
                            borderColor: date === getTomorrow() ? "#002D62" : "#cbd5e1",
                          }}
                        />
                      </Box>
                    </>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    height: 56,
                    alignSelf: "flex-start",
                    px: 4,
                    bgcolor: "#059669",
                    color: "#ffffff",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#047857" },
                    flexShrink: 0,
                    width: { xs: "100%", md: "auto" },
                  }}
                >
                  Sefer Bul
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4 }, py: 8 }}>
        <Typography
          component="h2"
          sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", textAlign: "center", mb: 4 }}
        >
          Neden Near East Way?
        </Typography>
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          }}
        >
          {BENEFITS.map((item) => (
            <Paper
              key={item.title}
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                border: "1px solid #e2e8f0",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: "0 4px 16px -4px rgba(0,0,0,0.08)" },
              }}
            >
              <Box sx={{ mb: 2 }}>{item.icon}</Box>
              <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
                {item.title}
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.7 }}>
                {item.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      <Box sx={{ bgcolor: "#ffffff", py: 8, borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0" }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4 } }}>
          <Typography
            component="h2"
            sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", mb: 4 }}
          >
            Popüler Seferler
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
            }}
          >
            {POPULAR_ROUTES.map((route, i) => (
              <Box
                key={i}
                onClick={() => {
                  setFrom(route.from);
                  setTo(route.to);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 2,
                  borderRadius: 2,
                  cursor: "pointer",
                  border: "1px solid #f1f5f9",
                  transition: "all 0.18s",
                  "&:hover": { borderColor: "#002D62", bgcolor: "#f8fafc" },
                }}
              >
                <DirectionsBusIcon sx={{ color: "#94a3b8", fontSize: 18, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
                  {route.from} → {route.to}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4 }, py: 6 }}>
        <Typography
          component="h3"
          sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", mb: 2 }}
        >
          Kıbrıs&apos;nin Lider Otobüs Bileti Platformu
        </Typography>
        <Typography sx={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.85, mb: 1.5 }}>
          Near East Way, Kıbrıs genelindeki yüzlerce otobüs firmasının seferlerini tek ekranda karşılaştırmanızı sağlayan kurumsal seyahat platformudur. 256-bit SSL şifreleme altyapısıyla güvenli ödeme imkânı sunmakta; hızlı bilet satın alma, kolay iptal ve iade süreçleriyle müşteri memnuniyetini ön planda tutmaktadır.
        </Typography>
        <Typography sx={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.85 }}>
          Promosyonlu seferler ve anlık koltuk durumu ile seyahat planlamanızı dakikalar içinde tamamlayın. İster iş ister tatil seyahati olsun, en uygun otobüs biletine ulaşmak için kalkış ve varış noktanızı seçin.
        </Typography>
      </Container>

      <CorporateFooter />
    </Box>
  );
}
