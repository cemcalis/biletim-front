"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DirectionsBusOutlinedIcon from "@mui/icons-material/DirectionsBusOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import { CorporateBanner } from "@/components/corporate-banner";
import { CorporateFooter } from "@/components/corporate-footer";
import UserNavbar from "@/components/user-navbar";
import { apiGet, apiRequest } from "../../lib/api";
import { getStoredUser, setStoredUser } from "../../lib/session";
import { paperHoverSx } from "../../lib/ui";

type Trip = {
  id: string;
  company: string;
  from: string;
  to: string;
  departureDate: string;
  arrivalDate: string;
  departureTime: string;
  durationMinutes: number;
  price: number;
  busType: string;
  rating: number;
  seatsTotal: number;
  seatsAvailable: number;
  seatLayout: "2+2" | "2+1" | "1+1";
};

type Seat = {
  seatNumber: string;
  status: "available" | "booked";
};

type BookingResponse = {
  ok: boolean;
  bookingCode?: string;
  message?: string;
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}s ${String(m).padStart(2, "0")}d`;
}

function getSeatLetters(layout?: "2+2" | "2+1" | "1+1") {
  if (layout === "2+1") return ["A", "B", "C"];
  if (layout === "1+1") return ["A", "B"];
  return ["A", "B", "C", "D"];
}

function getAisleAfter(layout?: "2+2" | "2+1" | "1+1") {
  return layout === "1+1" ? 1 : 2;
}

function splitSeatNumber(seatNumber: string) {
  const [, letter, row] = /^([A-Z]+)(\d+)$/.exec(seatNumber) ?? [];
  return { letter: letter ?? "", row: Number(row ?? 0) };
}

export default function SearchBusesPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
          <UserNavbar active="search" />
          <CorporateBanner
            eyebrow="Sefer Arama"
            title="Seferler yükleniyor..."
            subtitle="Lütfen bekleyin."
          />
        </Box>
      }
    >
      <SearchBusesContent />
    </Suspense>
  );
}

function SearchBusesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = new Date().toISOString().slice(0, 10);

  const [from, setFrom] = useState("İstanbul");
  const [to, setTo] = useState("Ankara");
  const [date, setDate] = useState(today);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [bookingInfo, setBookingInfo] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setFrom(searchParams.get("from") ?? "İstanbul");
    setTo(searchParams.get("to") ?? "Ankara");
    setDate(searchParams.get("date") ?? today);
  }, [searchParams, today]);

  useEffect(() => {
    const user = getStoredUser();
    const uName = user.name.trim();
    const uEmail = user.email.trim();
    setName(uName);
    setEmail(uEmail);
    setIsAuthenticated(Boolean(uName && uEmail));
  }, []);

  useEffect(() => {
    async function loadTrips() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ from, to, date });
        const data = await apiGet<Trip[]>(`/trips?${params.toString()}`);
        setTrips(data);
      } catch {
        setError("Sefer listesi yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    }
    void loadTrips();
  }, [date, from, to]);

  async function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ from, to, date });
    router.push(`/search-buses?${params.toString()}`);
  }

  async function onSelectTrip(trip: Trip) {
    setSelectedTrip(trip);
    setSelectedSeat("");
    setBookingInfo("");
    const res = await apiGet<{ found: boolean; seats: Seat[] }>(`/trips/${trip.id}/seats`);
    setSeats(res.found ? res.seats : []);
  }

  async function onBookSeat() {
    if (!isAuthenticated) {
      setBookingInfo("Bilet satın almak için önce hesabınıza giriş yapın.");
      return;
    }
    if (!selectedTrip || !selectedSeat || !name.trim() || !email.trim()) {
      setBookingInfo("Yolcu bilgisi, sefer ve koltuk seçimi zorunludur.");
      return;
    }
    try {
      const result = await apiRequest<BookingResponse>("/bookings", "POST", {
        tripId: selectedTrip.id,
        passengerName: name,
        passengerEmail: email,
        seatNumber: selectedSeat,
        travelDate: date,
      });
      if (result.ok) {
        setStoredUser(name, email);
        setIsAuthenticated(true);
        setBookingInfo(`Rezervasyon tamamlandı. Kod: ${result.bookingCode}`);
        await onSelectTrip(selectedTrip);
      } else {
        setBookingInfo(result.message ?? "Rezervasyon oluşturulamadı.");
      }
    } catch {
      setBookingInfo("İstek başarısız oldu. Lütfen tekrar deneyin.");
    }
  }

  const seatLetters = useMemo(() => getSeatLetters(selectedTrip?.seatLayout), [selectedTrip?.seatLayout]);
  const aisleAfter = useMemo(() => getAisleAfter(selectedTrip?.seatLayout), [selectedTrip?.seatLayout]);

  const seatRows = useMemo(() => {
    if (!seats.length) return [] as Array<Array<Seat | null>>;
    const maxRow = Math.max(...seats.map((s) => splitSeatNumber(s.seatNumber).row));
    return Array.from({ length: maxRow }, (_, i) => {
      const rowNo = i + 1;
      return seatLetters.map((letter) => seats.find((s) => s.seatNumber === `${letter}${rowNo}`) ?? null);
    });
  }, [seatLetters, seats]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8f9fa" }}>
      <UserNavbar active="search" />
      <CorporateBanner
        eyebrow="Sefer Arama"
        title="Otobüs Seferleri"
        subtitle="Kalkış, varış ve tarihe göre seferleri listeleyin, koltuk seçin ve güvenle rezervasyon yapın."
      />

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #e2e8f0", borderRadius: 2, mb: 3 }}>
          <Box
            component="form"
            onSubmit={onSearch}
            sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr auto" } }}
          >
            <TextField
              size="small"
              label="Nereden"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              fullWidth
            />
            <TextField
              size="small"
              label="Nereye"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              fullWidth
            />
            <TextField
              size="small"
              label="Tarih"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                height: 40,
                bgcolor: "#002D62",
                "&:hover": { bgcolor: "#001f44" },
                textTransform: "none",
                fontWeight: 700,
                alignSelf: "end",
                px: 3,
              }}
            >
              Ara
            </Button>
          </Box>
        </Paper>

        <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Typography sx={{ fontSize: "0.9rem", color: "#64748b" }}>
            <strong style={{ color: "#0f172a" }}>{from}</strong> →{" "}
            <strong style={{ color: "#0f172a" }}>{to}</strong> · {date}
          </Typography>
          {!loading && (
            <Box sx={{ px: 1.5, py: 0.5, bgcolor: "#002D62", borderRadius: 1 }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#ffffff" }}>
                {trips.length} sefer bulundu
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" } }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {loading && (
              <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>Seferler yükleniyor...</Typography>
              </Paper>
            )}
            {error && (
              <Paper elevation={0} sx={{ p: 3, border: "1px solid #fecaca", bgcolor: "#fef2f2", borderRadius: 2 }}>
                <Typography sx={{ color: "#dc2626", fontSize: "0.9rem" }}>{error}</Typography>
              </Paper>
            )}
            {!loading && trips.length === 0 && !error && (
              <Paper elevation={0} sx={{ p: 5, border: "1px solid #e2e8f0", borderRadius: 2, textAlign: "center" }}>
                <DirectionsBusOutlinedIcon sx={{ fontSize: 44, color: "#cbd5e1", mb: 1.5 }} />
                <Typography sx={{ color: "#64748b", fontWeight: 500 }}>
                  Bu güzergah ve tarih için sefer bulunamadı.
                </Typography>
              </Paper>
            )}

            {trips.map((trip) => (
              <Paper
                key={trip.id}
                elevation={0}
                sx={{
                  p: 3,
                  border: selectedTrip?.id === trip.id ? "1px solid #002D62" : "1px solid #e2e8f0",
                  borderRadius: 2,
                  ...paperHoverSx,
                }}
              >
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ minWidth: 160 }}>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                      {trip.company}
                    </Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "#64748b", mt: 0.5 }}>{trip.busType}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                      <StarOutlinedIcon sx={{ fontSize: 13, color: "#D4AF37" }} />
                      <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>{trip.rating}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                      {trip.departureTime}
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>{trip.from}</Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8" }}>
                      <AccessTimeOutlinedIcon sx={{ fontSize: 14 }} />
                      <Typography sx={{ fontSize: "0.82rem" }}>{formatDuration(trip.durationMinutes)}</Typography>
                    </Box>
                    <Box sx={{ height: 1, width: 60, bgcolor: "#e2e8f0", mx: "auto", my: 0.75 }} />
                    <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>{trip.to}</Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <EventSeatOutlinedIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                      <Typography sx={{ fontSize: "0.82rem", color: "#64748b" }}>
                        {trip.seatsAvailable} boş koltuk
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.25 }}>
                      {trip.seatLayout} düzen
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, color: "#002D62" }}>
                      ₺{trip.price}
                    </Typography>
                    <Button
                      onClick={() => void onSelectTrip(trip)}
                      variant="contained"
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: "#002D62",
                        "&:hover": { bgcolor: "#001f44" },
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2.5,
                      }}
                    >
                      Koltuk Seç
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>

          <Paper
            elevation={0}
            sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, alignSelf: "start", position: "sticky", top: 16 }}
          >
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", mb: 0.5 }}>
              Koltuk Seçimi
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748b", mb: 2 }}>
              {selectedTrip ? `${selectedTrip.company} · ${selectedTrip.from} → ${selectedTrip.to}` : "Lütfen önce bir sefer seçin"}
            </Typography>

            {selectedTrip && (
              <>
                <Box sx={{ display: "flex", gap: 2, mb: 2, fontSize: "0.75rem", color: "#64748b" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "2px", bgcolor: "#f1f5f9", border: "1px solid #cbd5e1" }} />
                    Boş
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "2px", bgcolor: "#002D62" }} />
                    Seçili
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "2px", bgcolor: "#e2e8f0" }} />
                    Dolu
                  </Box>
                </Box>

                <Box sx={{ p: 2, bgcolor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 70,
                      mx: "auto",
                      mb: 1.5,
                      py: 0.5,
                      textAlign: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#002D62",
                      bgcolor: "#e6eef5",
                      border: "1px solid #c8d8ea",
                      borderRadius: 1,
                    }}
                  >
                    Şoför
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                    {seatRows.map((row, rowIndex) => (
                      <Box key={`row-${rowIndex + 1}`} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {row.map((seat, colIndex) => (
                          <Box key={`seat-${rowIndex}-${colIndex}`} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {seat ? (
                              <Button
                                disabled={seat.status === "booked"}
                                onClick={() => setSelectedSeat(seat.seatNumber)}
                                variant="outlined"
                                sx={{
                                  minWidth: 0,
                                  width: 44,
                                  height: 36,
                                  p: 0,
                                  fontSize: "0.68rem",
                                  fontWeight: 600,
                                  textTransform: "none",
                                  borderRadius: 1,
                                  borderColor:
                                    seat.status === "booked"
                                      ? "#e2e8f0"
                                      : selectedSeat === seat.seatNumber
                                      ? "#002D62"
                                      : "#cbd5e1",
                                  bgcolor:
                                    seat.status === "booked"
                                      ? "#e2e8f0"
                                      : selectedSeat === seat.seatNumber
                                      ? "#002D62"
                                      : "#f1f5f9",
                                  color:
                                    seat.status === "booked"
                                      ? "#94a3b8"
                                      : selectedSeat === seat.seatNumber
                                      ? "#ffffff"
                                      : "#0f172a",
                                  "&:hover": {
                                    bgcolor:
                                      seat.status === "booked"
                                        ? "#e2e8f0"
                                        : selectedSeat === seat.seatNumber
                                        ? "#001f44"
                                        : "#e2e8f0",
                                  },
                                }}
                              >
                                {seat.seatNumber}
                              </Button>
                            ) : (
                              <Box sx={{ width: 44, height: 36 }} />
                            )}
                            {colIndex + 1 === aisleAfter && (
                              <Box sx={{ width: 10, height: 2, bgcolor: "#e2e8f0", borderRadius: 10 }} />
                            )}
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <TextField
                size="small"
                label="Ad Soyad"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAuthenticated}
                fullWidth
              />
              <TextField
                size="small"
                label="E-posta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isAuthenticated}
                fullWidth
              />
              {!isAuthenticated && (
                <Box sx={{ p: 1.5, bgcolor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.78rem", color: "#92400e" }}>
                    Rezervasyon için{" "}
                    <Box component={Link} href="/login" sx={{ fontWeight: 700, color: "#002D62", textDecoration: "none" }}>
                      giriş yapın
                    </Box>
                    .
                  </Typography>
                </Box>
              )}
              <Button
                onClick={() => void onBookSeat()}
                disabled={!isAuthenticated || !selectedSeat}
                variant="contained"
                fullWidth
                sx={{
                  bgcolor: "#059669",
                  "&:hover": { bgcolor: "#047857" },
                  "&:disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
                  textTransform: "none",
                  fontWeight: 700,
                  height: 44,
                }}
              >
                Rezervasyonu Onayla
              </Button>
              {bookingInfo && (
                <Typography sx={{ fontSize: "0.82rem", color: "#059669", fontWeight: 500, textAlign: "center" }}>
                  {bookingInfo}
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>

      <CorporateFooter />
    </Box>
  );
}
