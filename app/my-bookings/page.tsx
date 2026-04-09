"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import UserNavbar from "@/components/user-navbar";
import { CorporateFooter } from "@/components/corporate-footer";
import { apiGet, apiRequest } from "../../lib/api";
import { getStoredUser } from "../../lib/session";
import { paperHoverSx } from "../../lib/ui";

type Booking = {
  bookingCode: string;
  route: string;
  company: string;
  seatNumber: string;
  passengerName: string;
  passengerEmail: string;
  totalPrice: number;
  status: "Confirmed" | "Completed" | "Canceled";
  passengers: number;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
};

type ActiveTab = "bookings" | "payments";

const STATUS_MAP: Record<Booking["status"], { label: string; bgcolor: string; color: string }> = {
  Confirmed: { label: "Onaylandı", bgcolor: "#dcfce7", color: "#16a34a" },
  Completed: { label: "Tamamlandı", bgcolor: "#e0f2fe", color: "#0369a1" },
  Canceled: { label: "İptal Edildi", bgcolor: "#fee2e2", color: "#dc2626" },
};

export default function MyBookingsPage() {
  const initialUser = getStoredUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<ActiveTab>("bookings");
  const [name] = useState(initialUser.name || "Ziyaretçi");
  const [email] = useState(initialUser.email || "");

  const loadBookings = useCallback(async () => {
    if (!email) {
      setBookings([]);
      setMessage("Rezervasyonlarınızı görüntülemek için lütfen giriş yapın.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage("");
    const data = await apiGet<Booking[]>(`/bookings?passengerEmail=${encodeURIComponent(email)}`);
    setBookings(data);
    setLoading(false);
  }, [email]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadBookings(), 0);
    return () => window.clearTimeout(timer);
  }, [loadBookings]);

  async function onDownload(bookingCode: string) {
    const ticket = await apiGet<{ ok: boolean; fileName: string; content: string }>(
      `/bookings/${bookingCode}/ticket`
    );
    if (!ticket.ok) {
      setMessage("Bilet dosyası oluşturulamadı.");
      return;
    }
    const blob = new Blob([ticket.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = ticket.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function onCancel(bookingCode: string) {
    const result = await apiRequest<{ ok: boolean; message?: string }>(
      `/bookings/${bookingCode}/cancel`,
      "PATCH"
    );
    if (!result.ok) {
      setMessage(result.message ?? "Rezervasyon iptal edilemedi.");
      return;
    }
    setMessage("Rezervasyon başarıyla iptal edildi.");
    await loadBookings();
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8f9fa" }}>
      <UserNavbar active="bookings" />

      <Container maxWidth="lg" sx={{ py: 5, flex: 1 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: "#002D62",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography sx={{ color: "#D4AF37", fontWeight: 800, fontSize: "1rem" }}>
                {name.slice(0, 2).toUpperCase()}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                Hoş geldiniz, {name}
              </Typography>
              <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                Rezervasyonlarınızı yönetin
              </Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            href="/"
            variant="outlined"
            startIcon={<HomeOutlinedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderColor: "#e2e8f0",
              color: "#002D62",
              "&:hover": { borderColor: "#002D62", bgcolor: "transparent" },
            }}
          >
            Ana Sayfa
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value as ActiveTab)}
            sx={{
              borderBottom: "1px solid #e2e8f0",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "#64748b",
                minHeight: 48,
              },
              "& .Mui-selected": { color: "#002D62" },
              "& .MuiTabs-indicator": { bgcolor: "#002D62", height: 2 },
            }}
          >
            <Tab value="bookings" label="Rezervasyonlarım" icon={<ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
            <Tab value="payments" label="Ödeme Geçmişi" />
          </Tabs>
        </Box>

        {message && (
          <Box sx={{ mb: 3, p: 1.5, bgcolor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 1 }}>
            <Typography sx={{ fontSize: "0.85rem", color: "#1d4ed8" }}>{message}</Typography>
          </Box>
        )}

        {tab === "payments" && (
          <Paper elevation={0} sx={{ p: 4, border: "1px solid #e2e8f0", borderRadius: 2, textAlign: "center" }}>
            <Typography sx={{ fontSize: "0.9rem", color: "#64748b" }}>
              Ödeme geçmişi rezervasyon kayıtlarından otomatik oluşturulmaktadır.
            </Typography>
          </Paper>
        )}

        {tab === "bookings" && (
          <Box sx={{ display: "grid", gap: 2 }}>
            {loading && (
              <Paper elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>Rezervasyonlar yükleniyor...</Typography>
              </Paper>
            )}
            {!loading && bookings.length === 0 && (
              <Paper elevation={0} sx={{ p: 5, border: "1px solid #e2e8f0", borderRadius: 2, textAlign: "center" }}>
                <ConfirmationNumberOutlinedIcon sx={{ fontSize: 44, color: "#cbd5e1", mb: 1.5 }} />
                <Typography sx={{ color: "#64748b", fontWeight: 500 }}>
                  Henüz rezervasyon bulunmamaktadır.
                </Typography>
                <Button
                  component={Link}
                  href="/search-buses"
                  variant="contained"
                  sx={{ mt: 2, bgcolor: "#002D62", "&:hover": { bgcolor: "#001f44" }, textTransform: "none", fontWeight: 600 }}
                >
                  Sefer Ara
                </Button>
              </Paper>
            )}

            {bookings.map((booking) => {
              const badge = STATUS_MAP[booking.status];
              return (
                <Paper
                  key={booking.bookingCode}
                  elevation={0}
                  sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2, ...paperHoverSx }}
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, minWidth: 200 }}>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignSelf: "flex-start",
                          px: 1.25,
                          py: 0.4,
                          borderRadius: 1,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          bgcolor: badge.bgcolor,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </Box>
                      <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace" }}>
                        #{booking.bookingCode}
                      </Typography>
                      <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                        {booking.company}
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>{booking.route}</Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {booking.travelDate} · {booking.departureTime} – {booking.arrivalTime}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, textAlign: { xs: "left", sm: "right" } }}>
                      <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Koltuk: <strong style={{ color: "#0f172a" }}>{booking.seatNumber}</strong>
                      </Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Yolcu: <strong style={{ color: "#0f172a" }}>{booking.passengers}</strong>
                      </Typography>
                      <Typography sx={{ fontSize: "1.35rem", fontWeight: 800, color: "#002D62" }}>
                        ₺{booking.totalPrice}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 130 }}>
                      <Button
                        onClick={() => void onDownload(booking.bookingCode)}
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
                        Bileti İndir
                      </Button>
                      <Button
                        onClick={() => void onCancel(booking.bookingCode)}
                        disabled={booking.status === "Canceled"}
                        variant="outlined"
                        fullWidth
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                          borderColor: "#fecaca",
                          color: "#dc2626",
                          "&:hover": { borderColor: "#dc2626", bgcolor: "transparent" },
                          "&:disabled": { borderColor: "#e2e8f0", color: "#94a3b8" },
                        }}
                      >
                        İptal Et
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Container>

      <CorporateFooter />
    </Box>
  );
}
