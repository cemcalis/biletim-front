"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DirectionsBusOutlinedIcon from "@mui/icons-material/DirectionsBusOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";
import StarOutlinedIcon from "@mui/icons-material/StarOutlined";
import { CorporateBanner } from "@/components/corporate-banner";
import { apiGet, apiRequest } from "@/lib/api";
import { CYPRUS_CITIES } from "@/lib/cities";
import { getStoredUser, setStoredUser } from "@/lib/session";
import { paperHoverSx } from "@/lib/ui";

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
  status: "available" | "booked" | "held";
};

type BookingResponse = {
  ok: boolean;
  bookingCode?: string;
  bookingCodes?: string[];
  message?: string;
};

type SeatHoldResponse = {
  ok: boolean;
  message?: string;
  expiresAt?: number;
};

const SEAT_HOLDER_KEY = "seat_holder_id";

function getSeatHolderId() {
  if (typeof window === "undefined") {
    return "";
  }

  const stored = window.localStorage.getItem(SEAT_HOLDER_KEY);
  if (stored) {
    return stored;
  }

  const nextId = `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(SEAT_HOLDER_KEY, nextId);
  return nextId;
}

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

function formatHoldCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function SearchBusesPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ flex: 1, bgcolor: "#f8f9fa" }}>
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

  const [from, setFrom] = useState<string>(CYPRUS_CITIES[0]);
  const [to, setTo] = useState<string>(CYPRUS_CITIES[1]);
  const [date, setDate] = useState(today);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedSeatHoldExpiresAtBySeat, setSelectedSeatHoldExpiresAtBySeat] = useState<Record<string, number>>({});
  const [clockTick, setClockTick] = useState(Date.now());
  const [bookingInfo, setBookingInfo] = useState("");
  const [holderId, setHolderId] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadSeats = useCallback(async (tripId: string) => {
    const res = await apiGet<{ found: boolean; seats: Seat[] }>(`/trips/${tripId}/seats`);
    setSeats(res.found ? res.seats : []);
  }, []);

  const releaseSelectedSeat = useCallback(async (tripId: string, seatNumber: string) => {
    try {
      await apiRequest<SeatHoldResponse>(
        `/trips/${tripId}/seats/${encodeURIComponent(seatNumber)}/hold`,
        "DELETE",
        { holderId },
      );
    } catch {
      // Ignore release errors for expired or already released holds.
    }
  }, [holderId]);

  useEffect(() => {
    setHolderId(getSeatHolderId());
    setFrom(searchParams.get("from") ?? CYPRUS_CITIES[0]);
    setTo(searchParams.get("to") ?? CYPRUS_CITIES[1]);
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
    if (selectedTrip?.id && selectedSeats.length && holderId) {
      await Promise.all(selectedSeats.map((seatNumber) => releaseSelectedSeat(selectedTrip.id, seatNumber)));
    }

    setSelectedTrip(trip);
    setSelectedSeats([]);
    setSelectedSeatHoldExpiresAtBySeat({});
    setBookingInfo("");
    await loadSeats(trip.id);
  }

  async function onSelectSeat(seat: Seat) {
    if (!selectedTrip) {
      return;
    }
    if (!holderId) {
      setBookingInfo("Koltuk kilitlemek için oturum bilgisi oluşturulamadı.");
      return;
    }

    if (seat.status === "booked") {
      return;
    }

    const isAlreadySelected = selectedSeats.includes(seat.seatNumber);

    if (isAlreadySelected) {
      await releaseSelectedSeat(selectedTrip.id, seat.seatNumber);
      setSelectedSeats((current) => current.filter((seatNumber) => seatNumber !== seat.seatNumber));
      setSelectedSeatHoldExpiresAtBySeat((current) => {
        const next = { ...current };
        delete next[seat.seatNumber];
        return next;
      });
      setBookingInfo("");
      await loadSeats(selectedTrip.id);
      return;
    }

    try {
      const holdResult = await apiRequest<SeatHoldResponse>(
        `/trips/${selectedTrip.id}/seats/${encodeURIComponent(seat.seatNumber)}/hold`,
        "POST",
        { holderId },
      );

      if (!holdResult.ok) {
        setBookingInfo(holdResult.message ?? "Koltuk secimi basarisiz.");
        await loadSeats(selectedTrip.id);
        return;
      }

      setSelectedSeats((current) => [...current, seat.seatNumber]);
      setSelectedSeatHoldExpiresAtBySeat((current) => ({
        ...current,
        [seat.seatNumber]: holdResult.expiresAt ?? Date.now() + 120000,
      }));
      setBookingInfo("");
      await loadSeats(selectedTrip.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Koltuk secimi basarisiz.";
      setBookingInfo(message);
      await loadSeats(selectedTrip.id);
    }
  }

  async function onBookSeat() {
    if (!holderId) {
      setBookingInfo("Rezervasyon için oturum bilgisi oluşturulamadı.");
      return;
    }
    const normalizedPhone = phone.replace(/\s+/g, "").trim();
    if (!selectedTrip || !selectedSeats.length || !name.trim() || !email.trim() || !normalizedPhone) {
      setBookingInfo("Yolcu bilgisi, sefer ve en az bir koltuk seçimi zorunludur.");
      return;
    }
    if (!/^\+?[0-9]{10,15}$/.test(normalizedPhone)) {
      setBookingInfo("Telefon numarası geçerli olmalı (10-15 rakam). Örn: 905331112233");
      return;
    }
    try {
      const result = await apiRequest<BookingResponse>("/bookings", "POST", {
        tripId: selectedTrip.id,
        passengerName: name,
        passengerEmail: email,
        passengerPhone: normalizedPhone,
        holderId,
        seatNumbers: selectedSeats,
        passengers: selectedSeats.length,
        travelDate: date,
      });
      if (result.ok) {
        setStoredUser(name, email);
        setIsAuthenticated(true);
        setBookingInfo(
          `Rezervasyon tamamlandı. Kod: ${result.bookingCodes?.join(", ") ?? result.bookingCode ?? "-"}`,
        );
        setSelectedSeats([]);
        setSelectedSeatHoldExpiresAtBySeat({});
        await onSelectTrip(selectedTrip);
      } else {
        setBookingInfo(result.message ?? "Rezervasyon oluşturulamadı.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "İstek başarısız oldu. Lütfen tekrar deneyin.";
      setBookingInfo(message);
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

  const selectedSeatHoldRemainingMs = useMemo(() => {
    const expiries = Object.values(selectedSeatHoldExpiresAtBySeat);
    if (!expiries.length) {
      return 0;
    }

    return Math.max(0, Math.min(...expiries) - clockTick);
  }, [clockTick, selectedSeatHoldExpiresAtBySeat]);

  useEffect(() => {
    if (!Object.keys(selectedSeatHoldExpiresAtBySeat).length) {
      return;
    }

    const timer = window.setInterval(() => {
      setClockTick(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [selectedSeatHoldExpiresAtBySeat]);

  useEffect(() => {
    if (!selectedTrip?.id || !selectedSeats.length || !holderId || !Object.keys(selectedSeatHoldExpiresAtBySeat).length) {
      return;
    }

    if (selectedSeatHoldRemainingMs > 0) {
      return;
    }

    void Promise.all(selectedSeats.map((seatNumber) => releaseSelectedSeat(selectedTrip.id, seatNumber))).finally(() => {
      setSelectedSeats([]);
      setSelectedSeatHoldExpiresAtBySeat({});
      setBookingInfo("Koltuk tutma süresi doldu.");
      void loadSeats(selectedTrip.id);
    });
  }, [
    releaseSelectedSeat,
    loadSeats,
    holderId,
    selectedSeats,
    selectedSeatHoldExpiresAtBySeat,
    selectedSeatHoldRemainingMs,
    selectedTrip,
  ]);

  useEffect(() => {
    if (!selectedTrip) {
      return;
    }

    const timer = window.setInterval(() => {
      void loadSeats(selectedTrip.id);
    }, 3000);

    return () => {
      window.clearInterval(timer);
    };
  }, [loadSeats, selectedTrip]);

  useEffect(() => {
    return () => {
      if (!selectedTrip?.id || !selectedSeats.length || !holderId) {
        return;
      }

      void Promise.all(
        selectedSeats.map((seatNumber) =>
          apiRequest<SeatHoldResponse>(
            `/trips/${selectedTrip.id}/seats/${encodeURIComponent(seatNumber)}/hold`,
            "DELETE",
            { holderId },
          ),
        ),
      );
    };
  }, [holderId, selectedSeats, selectedTrip]);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#f8f9fa" }}>
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
              select
            >
              {CYPRUS_CITIES.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Nereye"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              fullWidth
              select
            >
              {CYPRUS_CITIES.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "2px", bgcolor: "#1e3a8a" }} />
                    Baska kullanici secti
                  </Box>
                </Box>

                {selectedSeats.length > 0 && (
                  <Box sx={{ mb: 2, p: 1.25, borderRadius: 1.5, bgcolor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#1d4ed8" }}>
                      Seçili koltuklar: {selectedSeats.join(", ")}
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "#1d4ed8", mt: 0.25 }}>
                      Kilit süresi: {formatHoldCountdown(selectedSeatHoldRemainingMs)}
                    </Typography>
                  </Box>
                )}

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
                                disabled={
                                  seat.status === "booked" ||
                                  (seat.status === "held" && !selectedSeats.includes(seat.seatNumber))
                                }
                                onClick={() => void onSelectSeat(seat)}
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
                                      : seat.status === "held" && !selectedSeats.includes(seat.seatNumber)
                                      ? "#1e3a8a"
                                      : selectedSeats.includes(seat.seatNumber)
                                      ? "#002D62"
                                      : "#cbd5e1",
                                  bgcolor:
                                    seat.status === "booked"
                                      ? "#e2e8f0"
                                      : seat.status === "held" && !selectedSeats.includes(seat.seatNumber)
                                      ? "#1e3a8a"
                                      : selectedSeats.includes(seat.seatNumber)
                                      ? "#002D62"
                                      : "#f1f5f9",
                                  color:
                                    seat.status === "booked"
                                      ? "#94a3b8"
                                      : seat.status === "held" && !selectedSeats.includes(seat.seatNumber)
                                      ? "#ffffff"
                                      : selectedSeats.includes(seat.seatNumber)
                                      ? "#ffffff"
                                      : "#0f172a",
                                  "&:hover": {
                                    bgcolor:
                                      seat.status === "booked"
                                        ? "#e2e8f0"
                                        : seat.status === "held" && !selectedSeats.includes(seat.seatNumber)
                                        ? "#1e3a8a"
                                        : selectedSeats.includes(seat.seatNumber)
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
                fullWidth
              />
              <TextField
                size="small"
                label="E-posta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField
                size="small"
                label="Telefon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="905331112233"
                fullWidth
              />
              {!isAuthenticated && (
                <Box sx={{ p: 1.5, bgcolor: "#fffbeb", border: "1px solid #fde68a", borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.78rem", color: "#92400e" }}>
                    Giriş yapmadan da rezervasyon oluşturabilirsiniz. Giriş yaparsanız bilgilerinizi otomatik doldururuz.
                  </Typography>
                </Box>
              )}
              <Button
                onClick={() => void onBookSeat()}
                disabled={!selectedSeats.length}
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
    </Box>
  );
}
