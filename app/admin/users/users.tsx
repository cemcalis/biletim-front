"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { apiGet } from "../../../lib/api";
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

type StoredUser = {
  name: string;
  email: string;
  bookings: number;
  lastTrip: string;
  spent: number;
};

const menuItems: SidebarItem[] = [
  { label: "Ana Sayfa", href: "/admin", key: "overview" },
  { label: "Seferler", href: "/admin#trips", key: "trips" },
  { label: "Firma Başvuruları", href: "/admin#requests", key: "requests" },
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

export default function AdminUsersPage() {
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
        setMessage("Kullanıcı listesi yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    void loadBookings();
  }, []);

  const users = useMemo(() => {
    const grouped = new Map<string, StoredUser>();

    bookings.forEach((booking) => {
      const current = grouped.get(booking.passengerEmail) ?? {
        name: booking.passengerName,
        email: booking.passengerEmail,
        bookings: 0,
        lastTrip: booking.route,
        spent: 0,
      };

      current.bookings += 1;
      current.lastTrip = booking.route;
      current.spent += booking.totalPrice;
      grouped.set(booking.passengerEmail, current);
    });

    const needle = search.trim().toLocaleLowerCase("tr-TR");
    return Array.from(grouped.values()).filter((user) => {
      if (!needle) {
        return true;
      }
      return [user.name, user.email, user.lastTrip].some((value) => value.toLocaleLowerCase("tr-TR").includes(needle));
    });
  }, [bookings, search]);

  const metrics = useMemo(
    () => [
      { label: "Kullanıcı", value: users.length },
      { label: "Rezervasyon", value: bookings.length },
      { label: "Aktif rol", value: role },
    ],
    [bookings.length, role, users.length],
  );

  return (
    <AdminPageShell
      title="Near East Ulasim"
      subtitle="Yönetici araçları"
      active="users"
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
      topBadgeLabel="Kullanıcı Yönetimi"
    >
      <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Kullanıcı Yönetimi</Typography>
            <Typography sx={{ mt: 0.5, fontSize: "0.84rem", color: "#6c768b" }}>
              Rezervasyon yapan yolcuları tek ekranda görüntüleyin.
            </Typography>
          </Box>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 1.5, py: 1, borderRadius: 999, background: "#eef4ff", color: "#2b60d4", fontSize: "0.8rem", fontWeight: 700 }}>
            <GroupOutlinedIcon sx={{ fontSize: 18 }} />
            {users.length} kayıt
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" } }}>
          {metrics.map((item) => (
            <Paper key={item.label} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #d5deee", background: "#eef3fb", boxShadow: "none" }}>
              <Typography sx={{ fontSize: "0.75rem", color: "#6f7890" }}>{item.label}</Typography>
              <Typography sx={{ mt: 0.5, fontSize: "1.35rem", fontWeight: 800, color: "#1d2d4d" }}>{item.value}</Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <TextField size="small" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="İsim, e-posta, rota ara..." sx={{ minWidth: { xs: "100%", md: 320 } }} />
        </Box>

        {message ? <Typography sx={{ mt: 2, p: 1.5, borderRadius: 1.5, bgcolor: "#ecf2ff", color: "#285fdf", fontSize: "0.85rem" }}>{message}</Typography> : null}

        {loading ? (
          <Typography sx={{ mt: 2 }}>Kullanıcılar yükleniyor...</Typography>
        ) : (
          <Box sx={{ mt: 2.5, display: "grid", gap: 1.5 }}>
            {users.length === 0 ? (
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
                <Typography>Kayıtlı kullanıcı bulunamadı.</Typography>
              </Paper>
            ) : (
              users.map((user) => (
                <Paper key={user.email} elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none" }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 800 }}>{user.name}</Typography>
                      <Typography sx={{ mt: 0.5, fontSize: "0.85rem", color: "#5b6b87" }}>{user.email}</Typography>
                      <Typography sx={{ mt: 0.5, fontSize: "0.82rem", color: "#5b6b87" }}>Son rota: {user.lastTrip}</Typography>
                    </Box>

                    <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                      <Typography sx={{ fontSize: "0.82rem", color: "#6c768b" }}>Rezervasyon</Typography>
                      <Typography sx={{ fontSize: "1.1rem", fontWeight: 800 }}>{user.bookings}</Typography>
                      <Typography sx={{ mt: 0.5, fontSize: "0.82rem", color: "#6c768b" }}>Toplam harcama</Typography>
                      <Typography sx={{ fontSize: "1.1rem", fontWeight: 800, color: "#2a64e8" }}>₺ {user.spent}</Typography>
                    </Box>

                    <Button variant="outlined" color="error" size="small" startIcon={<DeleteOutlineRoundedIcon />} onClick={() => setMessage(`${user.email} için silme işlemi bu sürümde kapalı.`)} sx={{ textTransform: "none", borderRadius: 2, alignSelf: "center" }}>
                      Kullanıcıyı Sil
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