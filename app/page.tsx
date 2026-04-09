"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
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
  const [tripType, setTripType] = useState("");
  const [from, setFrom] = useState("");   
  
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [routeCards, setRouteCards] = useState<RouteSummary[]>([]);
  const [passengerCount, setPassengerCount] = useState(1);

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef2f8", color: "#121f36" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background: "#1f3971",
          borderBottomLeftRadius: { xs: 20, md: 30 },
          borderBottomRightRadius: { xs: 20, md: 30 },
          pb: { xs: 4, md: 6 },
        }}
      >
        <UserNavbar active="home" variant="hero" />

        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, pt: { xs: 10, md: 13 } }}>
          <Box sx={{ textAlign: "center", color: "#fff" }}>
            <Typography sx={{ fontSize: { xs: "1.95rem", md: "2.7rem" }, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Kıbrıs&apos;ın Seyahat Uygulaması
            </Typography>
            <Typography sx={{ mt: 1.1, fontSize: "0.95rem", color: "#dbe5f7" }}>
              Otobus rezervasyon islemlerini hizli sekilde yonetin
            </Typography>

            <Box
              sx={{
                mt: 2.6,
                display: "inline-flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1,
                p: 0.75,
                borderRadius: 999,
                bgcolor: "#2b4a89",
              }}
            >
              {[
             
                { label: "Otobüs", active: true },
               
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    px: 1.35,
                    py: 0.7,
                    borderRadius: 999,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: item.active ? "#1f3971" : "#eef6ff",
                    bgcolor: item.active ? "#fff" : "transparent",
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: { xs: 2.5, md: 3 } }}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 2.25 },
                borderColor: "#d9e0ee",
                borderRadius: 2,
                boxShadow: "0 18px 40px rgba(9, 29, 66, 0.2)",
                bgcolor: "#ffffff",
              }}
            >
              <FormControl sx={{ width: "100%", display: "flex", alignItems: "flex-start" }}>
                <RadioGroup
                  row
                  name="trip-type"
                  value={tripType}
                  onChange={(event) => setTripType(event.target.value)}
                  sx={{
                    "& .MuiFormControlLabel-label": { fontSize: "0.82rem" },
                    "& .MuiRadio-root": { p: 0.4 },
                  }}
                >
                  <FormControlLabel value="tek-yon" control={<Radio size="small" />} label="Tek yon" />
                  <FormControlLabel value="gidis-donus" control={<Radio size="small" />} label="Gidis-donus" />
                </RadioGroup>
              </FormControl>

              <Box
                component="form"
                onSubmit={onSearch}
                sx={{
                  mt: 1,
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr 1fr auto" },
                }}
              >
                <TextField size="small" label="Nereden" value={from} onChange={(e) => setFrom(e.target.value)} fullWidth />
                <TextField size="small" label="Nereye" value={to} onChange={(e) => setTo(e.target.value)} fullWidth />
                <TextField size="small" label="Gidis tarihi" value={date} onChange={(e) => setDate(e.target.value)} type="date" slotProps={{ inputLabel: { shrink: true } }} fullWidth />
                <TextField size="small" label="Yolcu" value={passengerCount} onChange={(e) => setPassengerCount(Number(e.target.value))} type="number" fullWidth />
                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  sx={{
                    minHeight: 40,
                    px: 2.5,
                    bgcolor: "#1f3971",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    boxShadow: "none",
                    alignSelf: "stretch",
                    "&:hover": { bgcolor: "#264a90" },
                  }}
                >
                  Ucuz bilet bul
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

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
                sx={{ fontSize: "1.35rem", fontWeight: 700, color: "#1f3971" }}
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
              <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#1f3971" }}>{item.title}</Typography>
              <Typography sx={{ mt: 0.5, fontSize: "0.82rem", color: "#5c6883" }}>{item.description}</Typography>
            </Paper>
          ))}
        </Box>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <Button href="/register" variant="contained" sx={{ textTransform: "none", bgcolor: "#1f3971", boxShadow: "none", "&:hover": { bgcolor: "#264a90" } }}>
            Üye Ol
          </Button>
        </Box>
      </Container>

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, pb: 6 }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2, md: 3 },
            border: "1px solid #d9e0ee",
            borderRadius: 2,
            bgcolor: "#f7f9fd",
            boxShadow: "none",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#1f3971" }}>Kampanyalar</Typography>
          <Typography sx={{ mt: 1, fontSize: "0.86rem", color: "#5c6883" }}>
            Donemsel indirimler, ogrenci avantajlari ve erken rezervasyon firsatlari burada.
          </Typography>
          <Button
            href="/campaigns"
            variant="contained"
            disableElevation
            sx={{ mt: 2, textTransform: "none", bgcolor: "#1f3971", "&:hover": { bgcolor: "#264a90" } }}
          >
            Kampanyalari Gor
          </Button>
        </Paper>
      </Container>

      <CorporateFooter />
    </Box>
  );
}
