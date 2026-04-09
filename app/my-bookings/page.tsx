"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Box, Button, Container, Paper, Tab, Tabs, Typography } from "@mui/material";
import UserNavbar from "@/components/user-navbar";
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

type ActiveTab = "bookings" | "payments" ;

function statusStyles(status: Booking["status"]) {
  if (status === "Confirmed") return { bgcolor: "#e7f7ee", color: "#1f7a3d" };
  if (status === "Completed") return { bgcolor: "#e6f2ff", color: "#1f5fbf" };
  return { bgcolor: "#fdecef", color: "#c84558" };
}

export default function MyBookingsPage() {
  const initialUser = getStoredUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<ActiveTab>("bookings");
  const [name] = useState(initialUser.name || "Misafir");
  const [email] = useState(initialUser.email || "");

  const loadBookings = useCallback(async () => {
    if (!email) {
      setBookings([]);
      setMessage("Rezervasyonları görmek için önce giriş yapın.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");
    const query = email ? `?passengerEmail=${encodeURIComponent(email)}` : "";
    const data = await apiGet<Booking[]>(`/bookings${query}`);
    setBookings(data);
    setLoading(false);
  }, [email]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBookings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBookings]);

  async function onDownload(bookingCode: string) {
    const ticket = await apiGet<{ ok: boolean; fileName: string; content: string }>(`/bookings/${bookingCode}/ticket`);
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
    const result = await apiRequest<{ ok: boolean; message?: string }>(`/bookings/${bookingCode}/cancel`, "PATCH");
    if (!result.ok) {
      setMessage(result.message ?? "Rezervasyon iptal edilemedi.");
      return;
    }
    setMessage("Rezervasyon iptal edildi.");
    await loadBookings();
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fa", color: "#12203a" }}>
      <UserNavbar active="bookings" />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ display: "grid", height: 48, width: 48, placeItems: "center", borderRadius: "50%", bgcolor: "#e5eaf6", fontSize: "0.82rem", fontWeight: 700 }}>
              {name.slice(0, 2).toUpperCase()}
            </Box>
            <Box>
              <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Hoş geldiniz, {name}!</Typography>
              <Typography sx={{ fontSize: "0.9rem", color: "#5b6b87" }}>Rezervasyonlarınızı ve profilinizi yönetin</Typography>
            </Box>
          </Box>
          <Button component={Link} href="/" variant="outlined" sx={{ textTransform: "none", borderColor: "#d8dfed", color: "#24324f", boxShadow: "none" }}>
            Ana Sayfaya Dön
          </Button>
        </Box>

        <Paper elevation={0} sx={{ mt: 2.5, p: 0.75, bgcolor: "#e8ebf2", border: "1px solid #dde4f1", boxShadow: "none", display: "inline-flex" }}>
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value as ActiveTab)}
            slotProps={{ indicator: { style: { display: "none" } } }}
            sx={{ minHeight: 0, "& .MuiTab-root": { minHeight: 0, py: 1, px: 3, textTransform: "none", fontSize: "0.85rem", borderRadius: 2 } }}
          >
            <Tab value="bookings" label="Rezervasyonlarım" sx={{ bgcolor: tab === "bookings" ? "#fff" : "transparent", fontWeight: tab === "bookings" ? 600 : 400, color: "#5a647d" }} />
            <Tab value="payments" label="Ödemeler" sx={{ bgcolor: tab === "payments" ? "#fff" : "transparent", fontWeight: tab === "payments" ? 600 : 400, color: "#5a647d" }} />
           </Tabs>
        </Paper>

        {message ? <Typography sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: "#ecf2ff", color: "#285fdf", fontSize: "0.85rem" }}>{message}</Typography> : null}


        {tab === "payments" ? (
          <Paper elevation={0} sx={{ mt: 2.5, p: 2.5, border: "1px solid #dde4f1", boxShadow: "none" }}>
            <Typography sx={{ fontSize: "0.9rem", color: "#5f6d88" }}>
              Tüm ödemeler rezervasyon kayıtlarından otomatik oluşur. İşlem geçmişi için rezervasyon listenizi inceleyin.
            </Typography>
          </Paper>
        ) : null}

        {tab === "bookings" ? (
          <Box sx={{ mt: 2.5, display: "grid", gap: 1.5 }}>
            {loading ? <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #dde4f1", boxShadow: "none", cursor: "default", ...paperHoverSx }}>Rezervasyonlar yükleniyor...</Paper> : null}
            {!loading && !bookings.length ? (
              <Paper elevation={0} sx={{ p: 2.5, border: "1px solid #dde4f1", boxShadow: "none", cursor: "default", ...paperHoverSx }}>Bu hesapta rezervasyon bulunamadı.</Paper>
            ) : null}

            {bookings.map((booking) => {
              const badge = statusStyles(booking.status);
              return (
                <Paper key={booking.bookingCode} elevation={0} sx={{ p: 2.5, border: "1px solid #dde4f1", boxShadow: "none", cursor: "default", ...paperHoverSx }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                    <Box sx={{ display: "grid", gap: 0.75 }}>
                      <Box sx={{ alignSelf: "start", px: 1.25, py: 0.45, borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, bgcolor: badge.bgcolor, color: badge.color }}>
                        {booking.status}
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", color: "#66758f" }}>#{booking.bookingCode}</Typography>
                      <Typography sx={{ fontSize: "1.35rem", fontWeight: 700 }}>{booking.company}</Typography>
                      <Typography sx={{ fontSize: "0.88rem", color: "#5f6d88" }}>{booking.route}</Typography>
                      <Typography sx={{ fontSize: "0.88rem", color: "#5f6d88" }}>{booking.travelDate}</Typography>
                      <Typography sx={{ fontSize: "0.88rem", color: "#5f6d88" }}>{booking.departureTime} - {booking.arrivalTime}</Typography>
                    </Box>

                    <Box sx={{ display: "grid", gap: 0.75, textAlign: { xs: "left", sm: "right" } }}>
                      <Typography sx={{ fontSize: "0.88rem", color: "#5f6d88" }}>Koltuk: {booking.seatNumber}</Typography>
                      <Typography sx={{ fontSize: "0.88rem", color: "#5f6d88" }}>Yolcu: {booking.passengers}</Typography>
                      <Typography sx={{ fontSize: "1.35rem", fontWeight: 700, color: "#245fe6" }}>₺ {booking.totalPrice}</Typography>
                    </Box>

                    <Box sx={{ display: "grid", gap: 1, minWidth: 140 }}>
                      <Button onClick={() => void onDownload(booking.bookingCode)} variant="contained" disableElevation sx={{ textTransform: "none", bgcolor: "#101a33", boxShadow: "none" }}>
                        İndir
                      </Button>
                      <Button onClick={() => void onCancel(booking.bookingCode)} disabled={booking.status === "Canceled"} variant="outlined" sx={{ textTransform: "none", borderColor: "#f0c5cc", color: "#d34255", boxShadow: "none" }}>
                        İptal Et
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}
