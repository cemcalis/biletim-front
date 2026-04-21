"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import EventSeatOutlinedIcon from "@mui/icons-material/EventSeatOutlined";
import { apiGet, apiRequest } from "@/lib/api";
import { AdminPageShell, AdminRole } from "@/components/admin-page-shell";
import { SidebarItem } from "@/components/collapsible-sidebar";

type BookingRecord = {
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
  createdAt: string;
};

const menuItems: SidebarItem[] = [
  { label: "Ana Sayfa", href: "/admin", key: "overview" },
  { label: "Seferler", href: "/admin#trips", key: "trips" },
  { label: "Firma Başvuruları", href: "/admin#requests", key: "requests" },
  { label: "Firmalar", href: "/admin#companies", key: "companies" },
  { label: "Kullanıcı Yönetimi", href: "/admin/users", key: "users" },
  { label: "Raporlar", href: "/admin#reports", key: "reports" },
  { label: "Ayarlar", href: "/admin#settings", key: "settings" },
];

function readStoredRole(): AdminRole {
  if (typeof window === "undefined") {
    return "super-admin";
  }
  return (localStorage.getItem("admin_role") as AdminRole | null) ?? "super-admin";
}

export default function AdminReservationsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AdminRole>("super-admin");
  const [username, setUsername] = useState("admin");

  useEffect(() => {
    setRole(readStoredRole());
    setUsername(localStorage.getItem("admin_username") ?? "admin");
  }, []);

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      setMessage("");
      try {
        const data = await apiGet<BookingRecord[]>("/bookings");
        setBookings(data);
      } catch {
        setMessage("Rezervasyonlar yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    void loadBookings();
  }, []);

  const visibleBookings = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("tr-TR");
    return bookings.filter((booking) => {
      if (!needle) {
        return true;
      }
      return [booking.bookingCode, booking.route, booking.passengerName, booking.passengerEmail, booking.company].some((value) =>
        value.toLocaleLowerCase("tr-TR").includes(needle),
      );
    });
  }, [bookings, search]);

  const stats = useMemo(
    () => [
      { label: "Toplam rezervasyon", value: bookings.length },
      { label: "Görüntülenen", value: visibleBookings.length },
      { label: "Aktif rol", value: role },
    ],
    [bookings.length, role, visibleBookings.length],
  );

  async function onCancel(bookingCode: string) {
    const result = await apiRequest<{ ok: boolean; message?: string }>(`/bookings/${bookingCode}/cancel`, "PATCH");
    if (!result.ok) {
      setMessage(result.message ?? "İptal işlemi başarısız.");
      return;
    }

    setMessage("Rezervasyon iptal edildi.");
    const data = await apiGet<BookingRecord[]>("/bookings");
    setBookings(data);
  }

  return (
    <AdminPageShell
      title="Near East Way"
      subtitle="Rezervasyon yönetimi"
      active="trips"
      username={username}
      role={role}
      onRoleChange={setRole}
      onLogout={() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_role");
        localStorage.removeItem("admin_company");
        window.location.href = "/admin";
      }}
      items={menuItems}
      primaryActionHref="/admin"
      primaryActionLabel="Ana Panele Dön"
      topBadgeLabel="Rezervasyonlar"
    >
      <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Rezervasyon Yönetimi</Typography>
            <Typography sx={{ mt: 0.5, fontSize: "0.84rem", color: "#6c768b" }}>
              Tüm bilet kayıtlarını görüntüleyin, iptal edin veya inceleyin.
            </Typography>
          </Box>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.5, py: 1, borderRadius: 999, background: "#eef4ff", color: "#2b60d4", fontSize: "0.8rem", fontWeight: 700 }}>
            <EventSeatOutlinedIcon sx={{ fontSize: 18 }} />
            {visibleBookings.length} kayıt
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {stats.map((item) => (
            <Paper key={item.label} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #d5deee", background: "#eef3fb", boxShadow: "none" }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#6f7890" }}>{item.label}</Typography>
              <Typography sx={{ mt: 0.5, fontSize: "1.35rem", fontWeight: 800, color: "#1d2d4d" }}>{item.value}</Typography>
            </Paper>
          ))}
        </Box>

        <TextField size="small" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rezervasyon no, rota, yolcu ara..." sx={{ mt: 2, minWidth: { xs: "100%", md: 320 } }} />

        {message ? <Typography sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: "#ecf2ff", color: "#285fdf", fontSize: "0.85rem" }}>{message}</Typography> : null}

        {loading ? (
          <Typography sx={{ mt: 2 }}>Rezervasyonlar yükleniyor...</Typography>
        ) : (
          <Box sx={{ mt: 2.5, display: "grid", gap: 1.5 }}>
            {visibleBookings.length === 0 ? (
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
                <Typography>Rezervasyon bulunamadı.</Typography>
              </Paper>
            ) : (
              visibleBookings.map((booking) => (
                <Paper key={booking.bookingCode} elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                    <Box sx={{ display: "grid", gap: 0.5 }}>
                      <Typography sx={{ fontSize: "0.78rem", color: "#66758f" }}>#{booking.bookingCode}</Typography>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 800 }}>{booking.passengerName}</Typography>
                      <Typography sx={{ fontSize: "0.88rem", color: "#5f6d88" }}>{booking.route}</Typography>
                      <Typography sx={{ fontSize: "0.88rem", color: "#5f6d88" }}>{booking.travelDate} · {booking.departureTime}</Typography>
                      <Typography sx={{ fontSize: "0.88rem", color: "#5f6d88" }}>Koltuk: {booking.seatNumber}</Typography>
                    </Box>

                    <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                      <Typography sx={{ fontSize: "0.82rem", color: "#6c768b" }}>Durum</Typography>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 800 }}>{booking.status}</Typography>
                      <Typography sx={{ mt: 0.5, fontSize: "0.82rem", color: "#6c768b" }}>Tutar</Typography>
                      <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#2a64e8" }}>₺ {booking.totalPrice}</Typography>
                    </Box>

                    <Button
                      onClick={() => void onCancel(booking.bookingCode)}
                      disabled={booking.status === "Canceled"}
                      variant="outlined"
                      color="error"
                      sx={{ textTransform: "none", borderRadius: 2, alignSelf: "center" }}
                    >
                      İptal Et
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}
      </Paper>
    </AdminPageShell>
  );
}