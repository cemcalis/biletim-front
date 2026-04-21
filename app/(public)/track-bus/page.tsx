"use client";

import { FormEvent, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DirectionsBusOutlinedIcon from "@mui/icons-material/DirectionsBusOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import AirlineSeatReclineNormalOutlinedIcon from "@mui/icons-material/AirlineSeatReclineNormalOutlined";
import { apiGet } from "@/lib/api";

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

const STATUS_MAP: Record<Booking["status"], { label: string; bgcolor: string; color: string }> = {
  Confirmed: { label: "Onaylandı", bgcolor: "#dcfce7", color: "#16a34a" },
  Completed: { label: "Tamamlandı", bgcolor: "#e0f2fe", color: "#0369a1" },
  Canceled: { label: "İptal Edildi", bgcolor: "#fee2e2", color: "#dc2626" },
};

export default function TrackBusPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [result, setResult] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onTrack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    if (!bookingCode.trim()) return;
    setLoading(true);
    try {
      const booking = await apiGet<Booking | null>(`/bookings/${bookingCode.trim()}`);
      if (!booking) {
        setError("Bu rezervasyon koduna ait kayıt bulunamadı.");
        return;
      }
      setResult(booking);
    } catch {
      setError("Sorgulama sırasında bir hata oluştu. Lütfen kodu kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  const badge = result ? STATUS_MAP[result.status] : null;

  return (
      <Container maxWidth="sm" sx={{ py: 8, flex: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Typography component="h1" sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
            Sefer Durumu Sorgulama
          </Typography>
          <Typography sx={{ fontSize: "0.9rem", color: "#64748b" }}>
            Rezervasyon kodunuzu girerek sefer durumunuzu görüntüleyin.
          </Typography>
        </Box>

        <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, mb: 3 }}>
          <Box component="form" onSubmit={onTrack} sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
            <TextField
              fullWidth
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              label="Rezervasyon Kodu"
              placeholder="Örn: RB-123456"
              slotProps={{
                input: {
                  startAdornment: <SearchOutlinedIcon sx={{ color: "#94a3b8", mr: 1, fontSize: 20 }} />,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                height: 56,
                px: 3,
                flexShrink: 0,
                bgcolor: "#002D62",
                "&:hover": { bgcolor: "#001f44" },
                textTransform: "none",
                fontWeight: 700,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {loading ? "Sorgulanıyor..." : "Sorgula"}
            </Button>
          </Box>

          {error && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 1 }}>
              <Typography sx={{ fontSize: "0.85rem", color: "#dc2626" }}>{error}</Typography>
            </Box>
          )}
        </Paper>

        {result && badge && (
          <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ p: 3, bgcolor: "#002D62", color: "#ffffff" }}>
              <Box sx={{ display: "inline-flex", px: 1.25, py: 0.4, borderRadius: 1, fontSize: "0.72rem", fontWeight: 700, bgcolor: badge.bgcolor, color: badge.color, mb: 1.5 }}>
                {badge.label}
              </Box>
              <Typography sx={{ fontSize: "1.1rem", fontWeight: 800 }}>{result.company}</Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "#c8d8ea", mt: 0.5 }}>{result.route}</Typography>
            </Box>

            <Divider />

            <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <DirectionsBusOutlinedIcon sx={{ color: "#002D62", fontSize: 20 }} />
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>YOLCU</Typography>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a" }}>{result.passengerName}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <AirlineSeatReclineNormalOutlinedIcon sx={{ color: "#002D62", fontSize: 20 }} />
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>KOLTUK</Typography>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a" }}>{result.seatNumber}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <AccessTimeOutlinedIcon sx={{ color: "#002D62", fontSize: 20 }} />
                <Box>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>TARİH VE SAAT</Typography>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#0f172a" }}>
                    {result.travelDate} · {result.departureTime} – {result.arrivalTime}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>
                #{result.bookingCode}
              </Typography>
            </Box>
          </Paper>
        )}
      </Container>
  );
}
