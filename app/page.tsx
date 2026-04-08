"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { CorporateBanner } from "@/components/corporate-banner";
import { CorporateFooter } from "@/components/corporate-footer";
import UserNavbar from "@/components/user-navbar";
import { apiGet } from "../lib/api";
import { paperHoverSx } from "../lib/ui";

type RouteSummary = {
  from: string;
  to: string;
  basePrice: number;
  durationMinutes: number;
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export default function HomePage() {
  const router = useRouter();
  const [tripType, setTripType] = useState("Tekyon");
  const [from, setFrom] = useState("İstanbul");
  const [to, setTo] = useState("Ankara");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [routeCards, setRouteCards] = useState<RouteSummary[]>([]);
  const [passengerCount, setPassengerCount] = useState(1);
  const [luggageCount, setLuggageCount] = useState(0);

  useEffect(() => {
    apiGet<RouteSummary[]>("/routes")
      .then((data) => setRouteCards(data))
      .catch(() => setRouteCards([]));
  }, []);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ from, to, date });
    router.push(`/search-buses?${params.toString()}`);
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fa", color: "#121f36" }}>
      <UserNavbar active="home" />
      <CorporateBanner
        eyebrow="lorem ipsum dolor"
        title="Otobüs bileti arama, rezervasyon ve yönetimi tek çatı altında"
        subtitle="Kalkış, varış ve tarih bazlı arama yapın; işletmeler için de düzenli, güvenilir bir panel deneyimi kullanın."
      />

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
        <Box sx={{ textAlign: "center" }}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 3 },
              borderColor: "#d9e0ee",
              boxShadow: "none",
            }}
          >
            <FormControl sx={{ width: "100%", display: "flex", alignItems: "flex-start" }}>
              <FormLabel id="trip-type-label" sx={{ fontSize: "0.82rem", color: "#5c6883" }}>
                Seyahat tipi
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="trip-type-label"
                name="trip-type"
                value={tripType}
                onChange={(event) => setTripType(event.target.value)}
              >
                <FormControlLabel value="Tekyon" control={<Radio />} label="Tek Yön" />
                <FormControlLabel value="Gidisdonus" control={<Radio />} label="Gidiş Dönüş" />
              </RadioGroup>
            </FormControl>
            <Typography
              variant="h6"
              sx={{ fontSize: "1rem", fontWeight: 600, textAlign: "left" }}
            >
              Uygun seferi bulun
            </Typography>
            <Box
              component="form"
              onSubmit={onSearch}
              sx={{
                mt: 2,
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr auto" },
              }}
            >
              <TextField
                size="small"
                label="Nereden"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Kalkış şehri"
                fullWidth
              />
              <TextField
                size="small"
                label="Nereye"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Varış şehri"
                fullWidth
              />
              <TextField
                size="small"
                label="Yolcu Sayısı"
                value={passengerCount}
                onChange={(e) => setPassengerCount(Number(e.target.value))}
                type="number"
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
                 <TextField
                size="small"
                label="Bagaj"
                value={luggageCount}
                onChange={(e) => setLuggageCount(Number(e.target.value))}
                type="number"
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <TextField
                size="small"
                label="Tarih"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                disableElevation
                sx={{
                  minHeight: 40,
                  px: 3,
                  bgcolor: "#2a64e8",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  boxShadow: "none",
                  alignSelf: "end",
                }}
              >
                Ara
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, py: 4 }}>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {[
            ["500.000+", "Memnun yolcu"],
            ["2000+", "Aktif hat"],
            ["500+", "Şoför"],
            ["1500+", "Aktif sefer"],
          ].map(([value, label]) => (
            <Paper
              key={label}
              variant="outlined"
              sx={{
                flex: 1,
                minWidth: 180,
                p: 2.25,
                textAlign: "center",
                boxShadow: "none",
                cursor: "default",
                ...paperHoverSx,
              }}
            >
              <Typography
                sx={{ fontSize: "1.35rem", fontWeight: 700, color: "#1f3f7a" }}
              >
                {value}
              </Typography>
              <Typography
                sx={{ mt: 0.5, fontSize: "0.8rem", color: "#66758a" }}
              >
                {label}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, py: 4 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{ fontSize: "1.25rem", fontWeight: 700 }}
          >
            Neden Near East Ulaşım?
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#5a6a84" }}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus in assumenda sed dolore cupiditate explicabo maxime praesentium ipsa beatae soluta quibusdam, ullam corporis aut sequi, et, tempora dolorum dolorem dignissimos?
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 3,
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {[
            [
              "Güvenli Ödeme",
              "Kart, dijital cüzdan ve havale seçenekleriyle güvenli işlem",
            ],
            [
              "Canlı Takip",
              "Seferinizi anlık izleyin ve durum güncellemelerini takip edin",
            ],
            ["Kolay Rezervasyon", "Birkaç adımda hızlıca bilet ayırtın"],
            [
              "7/24 Destek",
              "İhtiyacınız olduğunda ulaşabileceğiniz destek kanalı",
            ],
          ].map(([title, description]) => (
            <Paper
              key={title}
              variant="outlined"
              sx={{
                p: 2.25,
                textAlign: "center",
                boxShadow: "none",
                cursor: "default",
                ...paperHoverSx,
              }}
            >
              <Typography sx={{ fontSize: "0.95rem", fontWeight: 600 }}>
                {title}
              </Typography>
              <Typography sx={{ mt: 1, fontSize: "0.82rem", color: "#5d6c87" }}>
                {description}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, pb: 6 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h5"
            sx={{ fontSize: "1.25rem", fontWeight: 700 }}
          >
            Popüler Hatlar
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#5a6a84" }}>
            Sık tercih edilen rotalara göz atın
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 3,
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {routeCards.map((item) => (
            <Paper
              key={`${item.from}-${item.to}`}
              variant="outlined"
              sx={{
                p: 2,
                boxShadow: "none",
                cursor: "default",
                ...paperHoverSx,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>
                    {item.from}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: "#5c6883" }}>
                    ile {item.to}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: "#eef2fa",
                    fontSize: "0.75rem",
                    color: "#1d2d4d",
                  }}
                >
                  ₺ {item.basePrice}
                </Box>
              </Box>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.82rem",
                  color: "#5c6883",
                }}
              >
                <span>{formatDuration(item.durationMinutes)}</span>
                <span>4,5</span>
              </Box>
            </Paper>
          ))}
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ mt: 2, px: { xs: 2, sm: 4 }, pb: 6 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.95rem", fontWeight: 700 }}>Daha fazla rota için takip edin</Typography>
        </Box>
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          }}
        >
          {[
            {
              title: "Misafir Listesi",
              description:
                "Konaklayacak kişileri kaydedin, her defasında bilgilerini girmeden hızlıca araç, transfer ve otel rezervasyonunuzu yapın, uçak biletinizi satın alın.",
            },
            {
              title: "Özel Fırsatlardan Yararlanın",
              description: "Üyelere özel indirim fırsatlarından yararlanın.",
            },
            {
              title: "Seyahatlerinizi Yönetin",
              description:
                "Tüm uçak, otel, araç ve transfer rezervasyonlarınızı tek bir yerden takip edip yönetebilirsiniz.",
            },
            {
              title: "Fatura Adresleri",
              description:
                "Fatura adreslerinizi kaydedin, her defasında bilgilerinizi girmeden hızlıca araç, transfer ve otel rezervasyonunuzu yapın, uçak biletinizi satın alın.",
            },
          ].map((item) => (
            <Paper
              key={item.title}
              variant="outlined"
              sx={{
                p: 1.5,
                border: "1px solid #d9e0ee",
                borderRadius: 1,
                bgcolor: "#f9fafe",
                boxShadow: "none",
                cursor: "default",
                ...paperHoverSx,
              }}
            >
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#" }}>{item.title}</Typography>
              <Typography sx={{ mt: 0.5, fontSize: "0.82rem", color: "#5c6883" }}>{item.description}</Typography>
            </Paper>
          ))}
        </Box>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Button href="/register" variant="contained" sx={{ textTransform: "none", bgcolor: "#2a64e8", boxShadow: "none" }}>
            Üye Ol
          </Button>
        </Box>
      </Container>

      <CorporateFooter />
    </Box>
  );
}
