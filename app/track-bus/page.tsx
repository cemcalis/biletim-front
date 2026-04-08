"use client";

import { FormEvent, useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import UserNavbar from "@/components/user-navbar";
import { apiGet } from "../../lib/api";

type Booking = {
  bookingCode: string;
  route: string;
  company: string;
  seatNumber: string;
  passengerName: string;
  status: "Confirmed" | "Completed" | "Canceled";
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
};

export default function TrackBusPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [result, setResult] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  async function onTrack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const booking = await apiGet<Booking | null>(`/bookings/${bookingCode}`);
      if (!booking) {
        setResult(null);
        setError("Rezervasyon kodu bulunamadı.");
        return;
      }
      setResult(booking);
    } catch {
      setResult(null);
      setError("Takip isteği başarısız oldu.");
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fa", color: "#12203a" }}>
      <UserNavbar active="track" />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: "1px solid #dce3f1", boxShadow: "none" }}>
          <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Sefer Takibi</Typography>
          <Typography sx={{ mt: 1, fontSize: "0.9rem", color: "#5b6b87" }}>Rezervasyon kodu ile sefer durumunu görüntüleyin.</Typography>

          <Box component="form" onSubmit={onTrack} sx={{ mt: 3, display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
            <TextField fullWidth size="small" value={bookingCode} onChange={(event) => setBookingCode(event.target.value)} label="Rezervasyon kodu" placeholder="Örn: RB-123456" />
            <Button type="submit" variant="contained" disableElevation sx={{ px: 3, textTransform: "none", bgcolor: "#2a64e8", boxShadow: "none" }}>
             İncele
            </Button>
          </Box>

          {error ? <Typography sx={{ mt: 2, fontSize: "0.82rem", color: "#d34255" }}>{error}</Typography> : null}

          {result ? (
            <Paper elevation={0} sx={{ mt: 3, p: 2.5, bgcolor: "#f6f8fd", border: "1px solid #dfe5f1", boxShadow: "none" }}>
              <Box sx={{ display: "grid", gap: 0.7 }}>
                <Typography sx={{ fontSize: "0.88rem" }}><strong>Kod:</strong> {result.bookingCode}</Typography>
                <Typography sx={{ fontSize: "0.88rem" }}><strong>Yolcu:</strong> {result.passengerName}</Typography>
                <Typography sx={{ fontSize: "0.88rem" }}><strong>Rota:</strong> {result.route}</Typography>
                <Typography sx={{ fontSize: "0.88rem" }}><strong>Firma:</strong> {result.company}</Typography>
                <Typography sx={{ fontSize: "0.88rem" }}><strong>Koltuk:</strong> {result.seatNumber}</Typography>
                <Typography sx={{ fontSize: "0.88rem" }}><strong>Durum:</strong> {result.status}</Typography>
                <Typography sx={{ fontSize: "0.88rem" }}><strong>Tarih:</strong> {result.travelDate}</Typography>
                <Typography sx={{ fontSize: "0.88rem" }}><strong>Saat:</strong> {result.departureTime} - {result.arrivalTime}</Typography>
              </Box>
            </Paper>
          ) : null}
        </Paper>
      </Container>
    </Box>
  );
}
