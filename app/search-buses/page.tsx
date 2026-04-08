"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
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
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}m`;
}

function getSeatLetters(layout?: "2+2" | "2+1" | "1+1") {
  if (layout === "2+1") {
    return ["A", "B", "C"];
  }
  if (layout === "1+1") {
    return ["A", "B"];
  }
  return ["A", "B", "C", "D"];
}

function getAisleAfter(layout?: "2+2" | "2+1" | "1+1") {
  if (layout === "1+1") {
    return 1;
  }
  return 2;
}

function splitSeatNumber(seatNumber: string) {
  const [, letter, row] = /^([A-Z]+)(\d+)$/.exec(seatNumber) ?? [];
  return {
    letter: letter ?? "",
    row: Number(row ?? 0),
  };
}

export default function SearchBusesPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fa", color: "#111d33" }}>
          <UserNavbar active="search" />
          <CorporateBanner
            eyebrow="Sefer arama"
            title="Seferler hazırlanıyor"
            subtitle="Kalkış, varış ve tarih bilgileri yükleniyor."
          />
          <Container maxWidth="lg" sx={{ py: 3 }}>
            <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #dfe5f1", boxShadow: "none", cursor: "default", ...paperHoverSx }}>
              <Typography sx={{ fontSize: "0.88rem" }}>Sayfa hazırlanıyor...</Typography>
            </Paper>
          </Container>
          <CorporateFooter />
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
    const userName = user.name.trim();
    const userEmail = user.email.trim();
    setName(userName);
    setEmail(userEmail);
    setIsAuthenticated(Boolean(userName && userEmail));
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
        setError("Sefer listesi yüklenemedi.");
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
    const seatResponse = await apiGet<{ found: boolean; seats: Seat[] }>(`/trips/${trip.id}/seats`);
    setSeats(seatResponse.found ? seatResponse.seats : []);
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
        setBookingInfo(`Rezervasyon oluşturuldu: ${result.bookingCode}`);
        await onSelectTrip(selectedTrip);
      } else {
        setBookingInfo(result.message ?? "Rezervasyon oluşturulamadı.");
      }
    } catch {
      setBookingInfo("Rezervasyon isteği başarısız oldu.");
    }
  }

  const visibleCount = useMemo(() => trips.length, [trips]);
  const seatLetters = useMemo(() => getSeatLetters(selectedTrip?.seatLayout), [selectedTrip?.seatLayout]);
  const aisleAfter = useMemo(() => getAisleAfter(selectedTrip?.seatLayout), [selectedTrip?.seatLayout]);

  const seatRows = useMemo(() => {
    if (!seats.length) {
      return [] as Array<Array<Seat | null>>;
    }

    const maxRow = Math.max(...seats.map((seat) => splitSeatNumber(seat.seatNumber).row));
    return Array.from({ length: maxRow }, (_, rowIndex) => {
      const rowNo = rowIndex + 1;
      return seatLetters.map((letter) => seats.find((seat) => seat.seatNumber === `${letter}${rowNo}`) ?? null);
    });
  }, [seatLetters, seats]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fa", color: "#111d33" }}>
      <UserNavbar active="search" />
      <CorporateBanner
        eyebrow="Sefer arama"
        title="Kalkış, varış ve tarih bazlı sefer sonuçları"
        subtitle="Aradığınız seferleri tek ekranda görün, koltuk seçin ve güvenli rezervasyon yapın."
      />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #dfe5f1", boxShadow: "none", cursor: "default", ...paperHoverSx }}>
          <Box component="form" onSubmit={onSearch} sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr auto" } }}>
            <TextField size="small" label="Nereden" value={from} onChange={(event) => setFrom(event.target.value)} placeholder="Kalkış şehri" fullWidth />
            <TextField size="small" label="Nereye" value={to} onChange={(event) => setTo(event.target.value)} placeholder="Varış şehri" fullWidth />
            <TextField size="small" label="Tarih" value={date} onChange={(event) => setDate(event.target.value)} type="date" slotProps={{ inputLabel: { shrink: true } }} fullWidth />
            <Button type="submit" variant="contained" disableElevation sx={{ minHeight: 40, px: 3, bgcolor: "#2a64e8", textTransform: "none", fontSize: "0.875rem", boxShadow: "none", alignSelf: "end" }}>
              Ara
            </Button>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ mt: 2, p: 2, border: "1px solid #dfe5f1", boxShadow: "none", cursor: "default", ...paperHoverSx }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
            <Typography sx={{ fontSize: "0.9rem", color: "#2c3b58" }}>
              {from} - {to} · {date}
            </Typography>
            <Box sx={{ px: 1.25, py: 0.5, borderRadius: 1, bgcolor: "#eef2fb", fontSize: "0.75rem" }}>{visibleCount} sefer bulundu</Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 2.5, display: "grid", gap: 2.5, gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" } }}>
          <Box sx={{ display: "grid", gap: 1.5 }}>
            {loading ? <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #dfe5f1", boxShadow: "none", cursor: "default", ...paperHoverSx }}>Seferler yükleniyor...</Paper> : null}
            {error ? <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #f3c7cc", bgcolor: "#fff5f6", boxShadow: "none", color: "#c44555", cursor: "default", ...paperHoverSx }}>{error}</Paper> : null}
            {!loading && !trips.length ? (
              <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #dfe5f1", boxShadow: "none", cursor: "default", ...paperHoverSx }}>Bu rota için sefer bulunamadı.</Paper>
            ) : null}

            {trips.map((trip) => (
              <Paper key={trip.id} elevation={0} sx={{ p: 2.5, border: "1px solid #dfe5f1", boxShadow: "none", cursor: "default", ...paperHoverSx }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: "0.98rem", fontWeight: 700 }}>{trip.company}</Typography>
                    <Typography sx={{ fontSize: "0.84rem", color: "#5f6d88" }}>{trip.busType}</Typography>
                    <Typography sx={{ fontSize: "0.76rem", color: "#5f6d88" }}>Düzen: {trip.seatLayout}</Typography>
                    <Typography sx={{ fontSize: "0.76rem", color: "#5f6d88" }}>{trip.rating} puan</Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "1.3rem", fontWeight: 700 }}>{trip.departureTime}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#5f6d88" }}>{trip.departureDate}</Typography>
                  </Box>

                  <Box sx={{ textAlign: "center", color: "#5f6d88", fontSize: "0.84rem" }}>
                    <Typography sx={{ fontSize: "0.84rem" }}>{formatDuration(trip.durationMinutes)}</Typography>
                    <Box sx={{ mx: "auto", mt: 0.8, height: 1, width: 56, bgcolor: "#d7ddea" }} />
                    <Typography sx={{ mt: 0.5, fontSize: "0.76rem" }}>Varış: {trip.arrivalDate}</Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "1.3rem", fontWeight: 700 }}>{trip.to}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#5f6d88" }}>{trip.seatsAvailable} koltuk boş</Typography>
                  </Box>

                  <Box sx={{ ml: "auto", textAlign: "right" }}>
                    <Typography sx={{ fontSize: "1.7rem", fontWeight: 700, color: "#2b65e7" }}>₺ {trip.price}</Typography>
                    <Button onClick={() => void onSelectTrip(trip)} variant="contained" disableElevation sx={{ mt: 1.2, textTransform: "none", bgcolor: "#2a64e8", boxShadow: "none" }}>
                      Koltuk Seç
                    </Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>

          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #dfe5f1", boxShadow: "none", cursor: "default", ...paperHoverSx }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>Koltuk Seçimi</Typography>
            <Typography sx={{ mt: 0.5, fontSize: "0.84rem", color: "#5f6d88" }}>
              {selectedTrip ? `${selectedTrip.company} (${selectedTrip.id})` : "Lütfen bir sefer seçin"}
            </Typography>

            <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.5, fontSize: "0.74rem", color: "#5f6d88" }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: "#f3f6fc", border: "1px solid #d8deec" }} /> Müsait
              <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: "#2a64e8" }} /> Seçili
              <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: "#eceff6" }} /> Dolu
            </Box>

            <Paper elevation={0} sx={{ mt: 1.5, p: 1.25, border: "1px solid #e1e8f5", bgcolor: "#fbfcff", boxShadow: "none" }}>
              <Box sx={{ ml: "auto", mb: 1.25, width: 74, textAlign: "center", fontSize: "0.72rem", fontWeight: 700, color: "#31476a", border: "1px solid #d6dff3", bgcolor: "#eaf0ff", borderRadius: 1, py: 0.4 }}>
                Şoför
              </Box>

              <Box sx={{ display: "grid", gap: 0.8 }}>
                {seatRows.map((row, rowIndex) => (
                  <Box key={`row-${rowIndex + 1}`} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {row.map((seat, index) => (
                      <Box key={`seat-${rowIndex + 1}-${index}`} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {seat ? (
                          <Button
                            disabled={seat.status === "booked"}
                            onClick={() => setSelectedSeat(seat.seatNumber)}
                            variant="outlined"
                            sx={{
                              minWidth: 0,
                              px: 0,
                              py: 0.75,
                              width: 48,
                              fontSize: "0.7rem",
                              textTransform: "none",
                              borderColor: seat.status === "booked" ? "#eceff6" : selectedSeat === seat.seatNumber ? "#2a64e8" : "#d8deec",
                              bgcolor: seat.status === "booked" ? "#eceff6" : selectedSeat === seat.seatNumber ? "#2a64e8" : "#f3f6fc",
                              color: seat.status === "booked" ? "#95a1ba" : selectedSeat === seat.seatNumber ? "#fff" : "#24324e",
                              boxShadow: "none",
                              "&:hover": { boxShadow: "none", bgcolor: seat.status === "booked" ? "#eceff6" : selectedSeat === seat.seatNumber ? "#2458d6" : "#eaf0fb" },
                            }}
                          >
                            {seat.seatNumber}
                          </Button>
                        ) : (
                          <Box sx={{ width: 48, height: 34 }} />
                        )}

                        {index + 1 === aisleAfter ? <Box sx={{ width: 12, height: 2, bgcolor: "#d6deec", borderRadius: 10, mx: 0.25 }} /> : null}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Paper>

            <Box sx={{ mt: 2, display: "grid", gap: 1.25 }}>
              <TextField size="small" value={name} onChange={(event) => setName(event.target.value)} placeholder="Örn: Cem Çalış" label="Ad Soyad" disabled={!isAuthenticated} />
              <TextField size="small" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Örn: cem@example.com" label="E-posta" disabled={!isAuthenticated} />
              {!isAuthenticated ? (
                <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #f3d58b", bgcolor: "#fff9ea", boxShadow: "none", fontSize: "0.75rem", color: "#986d1d", cursor: "default", ...paperHoverSx }}>
                  Rezervasyon için oturum açmanız gerekiyor.
                  <Box component={Link} href="/login" sx={{ ml: 0.5, fontWeight: 700, color: "#2a64e8", textDecoration: "none" }}>
                    Giriş yap
                  </Box>
                </Paper>
              ) : null}
              <Button onClick={() => void onBookSeat()} disabled={!isAuthenticated} variant="contained" disableElevation sx={{ textTransform: "none", bgcolor: "#101a33", boxShadow: "none" }}>
                Rezervasyonu Onayla
              </Button>
              {bookingInfo ? <Typography sx={{ fontSize: "0.82rem", color: "#2a64e8" }}>{bookingInfo}</Typography> : null}
            </Box>
          </Paper>
        </Box>
      </Container>

      <CorporateFooter />
    </Box>
  );
}
