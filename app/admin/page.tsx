"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DirectionsBusOutlinedIcon from "@mui/icons-material/DirectionsBusOutlined";

import { apiGet, apiRequest } from "../../lib/api";

type AdminOverviewResponse = {
  metrics: {
    totalBookings: number;
    activeUsers: number;
    busRoutes: number;
    revenue: number;
  };
};

type CompanyRequest = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  createdAt: string;
};

type AdminTrip = {
  id: string;
  tripCode?: string;
  company: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  price: number;
  isActive?: boolean;
};

type AdminRole = "super-admin" | "company-admin";
type FilterWindow = "all" | "today" | "two-days" | "week";
type AdminSection = "overview" | "trips" | "requests" | "users" | "reports" | "settings";

const ROLE_STORAGE_KEY = "admin_role";
const DRAWER_WIDTH = 250;

const roleConfig: Record<AdminRole, { label: string; allowedSections: AdminSection[] }> = {
  "super-admin": {
    label: "Sistem Yöneticisi",
    allowedSections: ["overview", "trips", "requests", "users", "reports", "settings"],
  },
  "company-admin": {
    label: "Firma Yetkilisi",
    allowedSections: ["overview", "trips", "settings"],
  },
};

const sectionConfig: Array<{ key: AdminSection; label: string; icon: React.ReactNode }> = [
  { key: "overview", label: "Dashboard", icon: <HomeOutlinedIcon /> },
  { key: "trips", label: "Sefer Yönetimi", icon: <DirectionsBusOutlinedIcon /> },
  { key: "requests", label: "Başvurular", icon: <AssignmentTurnedInOutlinedIcon /> },
  { key: "users", label: "Kullanıcılar", icon: <GroupOutlinedIcon /> },
  { key: "reports", label: "Raporlar", icon: <QueryStatsOutlinedIcon /> },
  { key: "settings", label: "Ayarlar", icon: <SettingsOutlinedIcon /> },
];

const roleOptions: Array<{ value: AdminRole; label: string }> = [
  { value: "super-admin", label: "Sistem Yöneticisi" },
  { value: "company-admin", label: "Firma Yetkilisi" },
];

const filterButtons: Array<{ value: FilterWindow; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "today", label: "Bugün" },
  { value: "two-days", label: "2 Gün" },
  { value: "week", label: "Bu Hafta" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);
}

function normalize(value: string) {
  return value.toLocaleLowerCase("tr-TR");
}

function daysFromToday(dateString: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${dateString}T12:00:00`);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [role, setRole] = useState<AdminRole>("super-admin");
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWindow, setFilterWindow] = useState<FilterWindow>("all");
  const [selectedCompany, setSelectedCompany] = useState("all");

  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);

  useEffect(() => {
    setToken(localStorage.getItem("admin_token") ?? "");
    const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as AdminRole | null;
    if (storedRole && roleConfig[storedRole]) setRole(storedRole);
  }, []);

  useEffect(() => {
    if (!token) return;
    async function loadData() {
      try {
        const [overviewData, tripData] = await Promise.all([
          apiGet<AdminOverviewResponse>("/admin/overview").catch(() => null),
          apiGet<AdminTrip[]>("/trips").catch(() => []),
        ]);
        if (overviewData) setOverview(overviewData);
        if (tripData) setTrips(tripData);
        const reqData = await apiGet<{ ok: boolean; requests?: CompanyRequest[] }>(
          `/admin/company-requests?token=${token}`
        ).catch(() => null);
        if (reqData?.ok && reqData.requests) setRequests(reqData.requests);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [token]);

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    try {
      const result = await apiRequest<{ ok: boolean; token?: string; message?: string; role?: AdminRole }>(
        "/admin/login", "POST", { username, password, role }
      );
      if (!result.ok || !result.token) return setLoginError(result.message ?? "Giriş başarısız.");
      localStorage.setItem("admin_token", result.token);
      localStorage.setItem(ROLE_STORAGE_KEY, result.role ?? role);
      setToken(result.token);
      setRole(result.role ?? role);
    } catch {
      setLoginError("Sunucu bağlantı hatası.");
    }
  }

  function onLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem(ROLE_STORAGE_KEY);
    setToken("");
    setTrips([]);
    setRequests([]);
    setOverview(null);
  }

  async function onApprove(companyId: string) {
    const res = await apiRequest<{ ok: boolean }>(`/admin/company-requests/${companyId}/approve`, "PATCH", { token });
    if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== companyId));
  }

  const visibleMenuItems = useMemo(
    () => sectionConfig.filter((item) => roleConfig[role].allowedSections.includes(item.key)),
    [role]
  );

  const companyOptions = useMemo(() => {
    const companies = Array.from(new Set(trips.map((t) => t.company).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "tr")
    );
    return ["all", ...companies];
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const companyMatch = selectedCompany === "all" || trip.company === selectedCompany;
      const term = normalize(searchTerm);
      const searchable = normalize([trip.id, trip.tripCode ?? "", trip.company, trip.from, trip.to].join(" "));
      const matchesSearch = !term || searchable.includes(term);
      const dayOffset = daysFromToday(trip.departureDate);
      const matchesFilter =
        filterWindow === "all" ||
        (filterWindow === "today" && dayOffset === 0) ||
        (filterWindow === "two-days" && dayOffset >= 0 && dayOffset <= 1) ||
        (filterWindow === "week" && dayOffset >= 0 && dayOffset <= 6);
      return companyMatch && matchesSearch && matchesFilter;
    });
  }, [filterWindow, searchTerm, selectedCompany, trips]);

  // ── LOGIN SCREEN ───────────────────────────────────────────────────────────
  if (!token) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Paper elevation={0} sx={{ p: 5, maxWidth: 420, width: "100%", borderRadius: 2, border: "1px solid #e2e8f0", textAlign: "center" }}>
          <Box sx={{ width: 44, height: 44, bgcolor: "#002D62", borderRadius: 1, mx: "auto", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, color: "#0f172a" }}>BİLETİM A.Ş. Yönetim</Typography>
          <Typography sx={{ color: "#64748b", mb: 4, fontSize: "0.9rem" }}>Kurumsal sisteme giriş yapın</Typography>
          <Box component="form" onSubmit={onLogin} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField fullWidth label="Kullanıcı Adı" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
            <TextField fullWidth select label="Erişim Yetkisi" value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
              {roleOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {loginError && <Typography sx={{ color: "#dc2626", fontSize: "0.85rem" }}>{loginError}</Typography>}
            <Button type="submit" variant="contained" sx={{ height: 48, bgcolor: "#002D62", "&:hover": { bgcolor: "#001f44" }, fontWeight: 700, textTransform: "none" }}>
              Giriş Yap
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // ── MAIN DASHBOARD ─────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* SIDEBAR */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#0f172a",
            color: "#ffffff",
            borderRight: "none",
          },
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#ffffff" }}>
            BİLETİM A.Ş.
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#64748b", mt: 0.5 }}>Yönetim Portalı</Typography>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
          <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", px: 1.5, mb: 1 }}>
            {roleConfig[role].label}
          </Typography>
        </Box>
        <List sx={{ px: 1.5, pt: 0 }}>
          {visibleMenuItems.map((item) => (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => setActiveSection(item.key)}
                sx={{
                  borderRadius: 1.5,
                  bgcolor: activeSection === item.key ? "rgba(255,255,255,0.1)" : "transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                }}
              >
                <ListItemIcon sx={{ color: activeSection === item.key ? "#ffffff" : "#64748b", minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: "0.9rem",
                        fontWeight: activeSection === item.key ? 600 : 400,
                        color: activeSection === item.key ? "#ffffff" : "#94a3b8",
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* TOP BAR */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: "#ffffff", borderBottom: "1px solid #e2e8f0", color: "#0f172a" }}>
          <Toolbar sx={{ justifyContent: "space-between", minHeight: "68px !important" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, maxWidth: 380 }}>
              <SearchRoundedIcon sx={{ color: "#94a3b8" }} />
              <TextField
                variant="standard"
                placeholder="Sefer veya firma ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                slotProps={{ input: { disableUnderline: true, sx: { fontSize: "0.9rem" } } }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {role === "super-admin" && (
                <TextField
                  select
                  size="small"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  sx={{ minWidth: 150 }}
                >
                  {companyOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>{opt === "all" ? "Tüm Firmalar" : opt}</MenuItem>
                  ))}
                </TextField>
              )}
              <IconButton sx={{ color: "#64748b" }}><NotificationsNoneRoundedIcon /></IconButton>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pl: 2, borderLeft: "1px solid #e2e8f0" }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#002D62", fontSize: "0.85rem" }}>A</Avatar>
                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                  <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.2 }}>{username}</Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{roleConfig[role].label}</Typography>
                </Box>
                <Button size="small" color="error" onClick={onLogout} sx={{ textTransform: "none", fontWeight: 600, ml: 1 }}>
                  Çıkış
                </Button>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        {/* PAGE BODY */}
        <Box sx={{ p: { xs: 3, md: 4 }, flexGrow: 1 }}>

          {/* ── OVERVIEW ── */}
          {activeSection === "overview" && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>Dashboard</Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>Sistem genel durumuna genel bakış.</Typography>

              {/* METRICS GRID */}
              <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(4, 1fr)" }, mb: 4 }}>
                {[
                  { label: "Toplam Rezervasyon", value: overview?.metrics.totalBookings ?? 0, color: "#3b82f6" },
                  { label: "Aktif Müşteri", value: overview?.metrics.activeUsers ?? 0, color: "#22c55e" },
                  { label: "Aktif Rota", value: overview?.metrics.busRoutes ?? 0, color: "#f59e0b" },
                  { label: "Toplam Gelir", value: formatCurrency(overview?.metrics.revenue ?? 0), color: "#8b5cf6" },
                ].map((card) => (
                  <Paper key={card.label} elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0", borderLeft: `4px solid ${card.color}` }}>
                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", mb: 1, letterSpacing: "0.06em" }}>
                      {card.label}
                    </Typography>
                    <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, color: "#0f172a" }}>{card.value}</Typography>
                  </Paper>
                ))}
              </Box>

              {/* RECENT TRIPS TABLE */}
              <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 2 }}>Son Seferler</Typography>
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>Firma</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>Güzergah</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>Tarih</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>Fiyat</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trips.slice(0, 8).map((trip) => (
                      <TableRow key={trip.id} hover>
                        <TableCell sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#002D62" }}>{trip.tripCode ?? trip.id}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem" }}>{trip.company}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{trip.from} → {trip.to}</TableCell>
                        <TableCell sx={{ fontSize: "0.82rem", color: "#64748b" }}>{trip.departureDate} {trip.departureTime}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>₺{trip.price}</TableCell>
                      </TableRow>
                    ))}
                    {trips.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: "#94a3b8" }}>Henüz sefer kaydı yok.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* ── TRIPS ── */}
          {activeSection === "trips" && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>Sefer Yönetimi</Typography>
                  <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>Sistemdeki seferleri listeleyin ve yönetin.</Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineOutlinedIcon />}
                  onClick={() => {
                    if (role === "company-admin") {
                      alert("Sefer onaya gönderildi! Sistem yöneticisi onaylamasının ardından satışa açılacaktır.");
                    } else {
                      alert("Yeni sefer formu açıldı. (Geliştirme aşamasında)");
                    }
                  }}
                  sx={{ bgcolor: "#002D62", "&:hover": { bgcolor: "#001f44" }, textTransform: "none", fontWeight: 600 }}
                >
                  {role === "company-admin" ? "Yeni Sefer (Onaya Gönder)" : "Yeni Sefer Ekle"}
                </Button>
              </Box>

              {/* FILTER CHIPS */}
              <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                {filterButtons.map((btn) => (
                  <Button
                    key={btn.value}
                    size="small"
                    onClick={() => setFilterWindow(btn.value)}
                    variant={filterWindow === btn.value ? "contained" : "outlined"}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "none",
                      bgcolor: filterWindow === btn.value ? "#0f172a" : "transparent",
                      color: filterWindow === btn.value ? "#fff" : "#64748b",
                      borderColor: "#cbd5e1",
                      "&:hover": { boxShadow: "none" },
                    }}
                  >
                    {btn.label}
                  </Button>
                ))}
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>Sefer Kodu</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>Firma</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>Güzergah</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>Tarih / Saat</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>Durum</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#475569", fontSize: "0.82rem" }}>Tutar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTrips.map((trip) => (
                      <TableRow key={trip.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: "#002D62", fontSize: "0.82rem" }}>{trip.tripCode ?? trip.id}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem" }}>{trip.company}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{trip.from} → {trip.to}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: "0.82rem" }}>{trip.departureDate}</Typography>
                          <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{trip.departureTime}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{
                            display: "inline-block", px: 1.5, py: 0.5, borderRadius: 1, fontSize: "0.75rem", fontWeight: 700,
                            bgcolor: trip.isActive === false ? "#fee2e2" : "#dcfce7",
                            color: trip.isActive === false ? "#dc2626" : "#16a34a",
                          }}>
                            {trip.isActive === false ? "İptal" : "Aktif"}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>₺{trip.price}</TableCell>
                      </TableRow>
                    ))}
                    {filteredTrips.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 5, color: "#94a3b8" }}>
                          Kriterlere uygun sefer bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* ── REQUESTS (super-admin only) ── */}
          {activeSection === "requests" && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>Firma Başvuruları</Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>Platforma katılmak isteyen onay bekleyen firmalar.</Typography>

              {requests.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: 2 }}>
                  <Typography sx={{ color: "#64748b" }}>Bekleyen başvuru bulunmamaktadır.</Typography>
                </Paper>
              ) : (
                <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" } }}>
                  {requests.map((req) => (
                    <Paper key={req.id} elevation={0} sx={{ p: 3, border: "1px solid #e2e8f0", borderRadius: 2 }}>
                      <Typography sx={{ fontSize: "1rem", fontWeight: 700, mb: 1 }}>{req.companyName}</Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 0.5 }}>Yetkili: {req.contactName}</Typography>
                      <Typography sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}>İletişim: {req.email}</Typography>
                      <Button variant="outlined" color="success" fullWidth onClick={() => onApprove(req.id)}>
                        Başvuruyu Onayla
                      </Button>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* ── OTHER SECTIONS ── */}
          {["users", "reports", "settings"].includes(activeSection) && (
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
                {sectionConfig.find((s) => s.key === activeSection)?.label}
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>Bu modül geliştirme aşamasındadır.</Typography>
              <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <FilterAltOutlinedIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 2 }} />
                <Typography sx={{ color: "#64748b", fontWeight: 500 }}>
                  Erişiminiz doğrulandı. Bu ekran yakında aktif olacaktır.
                </Typography>
              </Paper>
            </Box>
          )}

        </Box>
      </Box>
    </Box>
  );
}