"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { CollapsibleSidebar } from "@/components/collapsible-sidebar";
import { apiGet, apiRequest } from "../../lib/api";
import styles from "./page.module.css";

type AdminOverviewResponse = {
  metrics: {
    totalBookings: number;
    activeUsers: number;
    busRoutes: number;
    revenue: number;
  };
  revenueTrend?: Array<{ month: string; value: number }>;
  popularRoutes?: Array<{ label: string; value: number; color: string }>;
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
  arrivalDate: string;
  departureTime: string;
  durationMinutes: number;
  price: number;
  busType: string;
  rating: number;
  seatsTotal: number;
  seatsAvailable?: number;
  seatLayout: string;
  isActive?: boolean;
};

type AdminRole = "super-admin" | "company-admin";
type FilterWindow = "all" | "today" | "two-days" | "week";
type AdminSection = "overview" | "trips" | "requests" | "users" | "reports" | "settings";

const ROLE_STORAGE_KEY = "admin_role";
const COMPANY_STORAGE_KEY = "admin_company";

const roleConfig: Record<
  AdminRole,
  {
    label: string;
    subtitle: string;
    allowedSections: AdminSection[];
  }
> = {
  "super-admin": {
    label: "Admin",
    subtitle: "Tam erişim",
    allowedSections: ["overview", "trips", "requests", "users", "reports", "settings"],
  },
  "company-admin": {
    label: "Firma",
    subtitle: "Firma bazlı operasyon",
    allowedSections: ["overview", "trips", "settings"],
  },
};

const sectionConfig: Array<{
  key: AdminSection;
  label: string;
}> = [
  { key: "overview", label: "Ana Sayfa" },
  { key: "trips", label: "Seferler" },
  { key: "requests", label: "Firma Başvuruları" },
  { key: "users", label: "Kullanıcı Yönetimi" },
  { key: "reports", label: "Raporlar" },
  { key: "settings", label: "Ayarlar" },
];

const roleOptions: Array<{ value: AdminRole; label: string }> = [
  { value: "super-admin", label: "Admin" },
  { value: "company-admin", label: "Firma" },
];

const filterButtons: Array<{ value: FilterWindow; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "today", label: "Bugün" },
  { value: "two-days", label: "2 Gün" },
  { value: "week", label: "Bu Hafta" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalize(value: string) {
  return value.toLocaleLowerCase("tr-TR");
}

function daysFromToday(dateString: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDate = new Date(`${dateString}T12:00:00`);
  nextDate.setHours(0, 0, 0, 0);

  const diff = nextDate.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function getDirectionLabel(trip: AdminTrip) {
  return trip.from && trip.to ? "Çift Yön" : "Tek Yön";
}

function getTripStatusLabel(trip: AdminTrip) {
  return trip.isActive === false ? "Pasif" : "Planlandı";
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
  const [info, setInfo] = useState("");

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const storedToken = localStorage.getItem("admin_token") ?? "";
      setToken(storedToken);

      const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as AdminRole | null;
      if (storedRole && roleConfig[storedRole]) {
        setRole(storedRole);
      }

      setSelectedCompany(localStorage.getItem(COMPANY_STORAGE_KEY) ?? "all");
    });

    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const allowedSections = roleConfig[role].allowedSections;
    const hash = window.location.hash.replace("#", "") as AdminSection;
    let rafId = 0;

    if (hash && allowedSections.includes(hash)) {
      rafId = window.requestAnimationFrame(() => setActiveSection(hash));
    } else {
      const nextSection = allowedSections[0] ?? "overview";
      rafId = window.requestAnimationFrame(() => setActiveSection(nextSection));
    }

    const syncFromHash = () => {
      const nextHash = window.location.hash.replace("#", "") as AdminSection;
      if (nextHash && allowedSections.includes(nextHash)) {
        setActiveSection(nextHash);
      }
    };

    window.addEventListener("hashchange", syncFromHash);
    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [role]);

  useEffect(() => {
    async function loadData() {
      if (!token) {
        return;
      }

      try {
        const [overviewData, tripData] = await Promise.all([
          apiGet<AdminOverviewResponse>("/admin/overview"),
          apiGet<AdminTrip[]>("/trips"),
        ]);

        setOverview(overviewData);
        setTrips(tripData);

      } catch {
        setInfo("Yönetim verileri yüklenemedi.");
      }

      try {
        const requestData = await apiGet<{ ok: boolean; message?: string; requests: CompanyRequest[] }>(`/admin/company-requests?token=${encodeURIComponent(token)}`);
        if (!requestData.ok) {
          setInfo(requestData.message ?? "Başvurular yüklenemedi.");
          return;
        }
        setRequests(requestData.requests);
      } catch {
        setInfo("Firma başvuruları yüklenemedi.");
      }
    }

    void loadData();
  }, [token]);

  useEffect(() => {
    const allowedSections = roleConfig[role].allowedSections;
    if (!allowedSections.includes(activeSection)) {
      const nextSection = allowedSections[0] ?? "overview";
      const rafId = window.requestAnimationFrame(() => setActiveSection(nextSection));
      window.location.hash = nextSection;
      return () => window.cancelAnimationFrame(rafId);
    }
  }, [activeSection, role]);

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    try {
      const result = await apiRequest<{ ok: boolean; token?: string; message?: string; role?: AdminRole }>("/admin/login", "POST", {
        username,
        password,
        role,
      });

      if (!result.ok || !result.token) {
        setLoginError(result.message ?? "Giriş başarısız");
        return;
      }

      localStorage.setItem("admin_token", result.token);
      const nextRole = result.role ?? role;
      localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
      localStorage.setItem(COMPANY_STORAGE_KEY, selectedCompany);
      setToken(result.token);
      setRole(nextRole);
      setPassword("");
    } catch {
      setLoginError("Giriş isteği başarısız.");
    }
  }

  async function onApprove(companyId: string) {
    const result = await apiRequest<{ ok: boolean; message?: string }>(`/admin/company-requests/${companyId}/approve`, "PATCH", {
      token,
    });

    if (!result.ok) {
      setInfo(result.message ?? "Onay işlemi başarısız.");
      return;
    }

    setInfo("Firma onaylandı.");
    setRequests((current) => current.filter((item) => item.id !== companyId));
  }

  function onLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem(ROLE_STORAGE_KEY);
    localStorage.removeItem(COMPANY_STORAGE_KEY);
    setToken("");
    setRole("super-admin");
    setSelectedCompany("all");
    setOverview(null);
    setRequests([]);
    setTrips([]);
    setInfo("");
  }

  function onRoleChange(nextRole: AdminRole) {
    setRole(nextRole);
    localStorage.setItem(ROLE_STORAGE_KEY, nextRole);
  }

  function onCompanyChange(nextCompany: string) {
    setSelectedCompany(nextCompany);
    localStorage.setItem(COMPANY_STORAGE_KEY, nextCompany);
  }

  const visibleMenuItems = useMemo(
    () => sectionConfig.filter((item) => roleConfig[role].allowedSections.includes(item.key)),
    [role],
  );

  const companyOptions = useMemo(() => {
    const companies = Array.from(new Set(trips.map((trip) => trip.company).filter(Boolean))).sort((left, right) =>
      left.localeCompare(right, "tr"),
    );
    return ["all", ...companies];
  }, [trips]);

  useEffect(() => {
    if (selectedCompany !== "all" && companyOptions.length > 1 && !companyOptions.includes(selectedCompany)) {
      const rafId = window.requestAnimationFrame(() => setSelectedCompany("all"));
      localStorage.setItem(COMPANY_STORAGE_KEY, "all");
      return () => window.cancelAnimationFrame(rafId);
    }
  }, [companyOptions, selectedCompany]);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const companyMatch = selectedCompany === "all" || trip.company === selectedCompany;
      const search = normalize(searchTerm);
      const searchable = normalize(
        [
          trip.id,
          trip.tripCode ?? "",
          trip.company,
          trip.from,
          trip.to,
          trip.departureDate,
          trip.departureTime,
          trip.busType,
        ].join(" "),
      );

      const matchesSearch = !search || searchable.includes(search);
      const dayOffset = daysFromToday(trip.departureDate);
      const matchesFilter =
        filterWindow === "all" ||
        (filterWindow === "today" && dayOffset === 0) ||
        (filterWindow === "two-days" && dayOffset >= 0 && dayOffset <= 1) ||
        (filterWindow === "week" && dayOffset >= 0 && dayOffset <= 6);

      return companyMatch && matchesSearch && matchesFilter;
    });
  }, [filterWindow, searchTerm, selectedCompany, trips]);

  const metrics = useMemo(
    () => [
      { label: "Sefer", value: overview?.metrics.totalBookings ?? trips.length, hint: "Toplam operasyon", tone: "#3b82f6" },
      { label: "Aktif kullanıcı", value: overview?.metrics.activeUsers ?? 0, hint: "Rezervasyon oluşturan hesaplar", tone: "#22c55e" },
      { label: "Hat", value: overview?.metrics.busRoutes ?? 0, hint: "Açık rota", tone: "#f59e0b" },
      { label: "Gelir", value: formatCurrency(overview?.metrics.revenue ?? 0), hint: "Tahmini toplam", tone: "#8b5cf6" },
    ],
    [overview, trips.length],
  );

  if (!token) {
    return (
      <Box className={styles.loginRoot}>
        <Container maxWidth="sm" className={styles.loginContainer}>
          <Paper elevation={0} className={styles.loginCard}>
            <Box className={styles.loginBadge}> Near East Ulaşım</Box>
            <Typography  className={styles.loginTitle}>Admin Paneli</Typography>
            <Typography className={styles.loginSubtitle}>Admin paneliyle yönetim ekranı</Typography>

            <Box component="form" onSubmit={onLogin} className={styles.loginForm}>
              <TextField size="small" value={username} onChange={(event) => setUsername(event.target.value)} label="Kullanıcı adı" />
              <TextField select size="small" value={role} onChange={(event) => setRole(event.target.value as AdminRole)} label="Panel rolü">
                {roleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField size="small" value={password} onChange={(event) => setPassword(event.target.value)} label="Şifre" type="password" />
              <Button type="submit" variant="contained" disableElevation className={styles.primaryButton}>
                Giriş Yap
              </Button>
            </Box>
            {loginError ? <Typography className={styles.loginError}>{loginError}</Typography> : null}
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box className={styles.pageRoot}>
      <Container maxWidth="xl" className={styles.shellContainer}>
        <Paper elevation={0} className={styles.heroBanner}>
          <Box>
            <Typography className={styles.heroBannerTitle}>Near East Ulasim Admin</Typography>
            <Typography className={styles.heroBannerSubtitle}>Ana sayfadaki gibi tek bakista yonetim alani</Typography>
          </Box>
          <Box className={styles.heroBannerMeta}>
            <Box className={styles.heroBannerPill}>Panel: {roleConfig[role].label}</Box>
            <Box className={styles.heroBannerPill}>Toplam Sefer: {filteredTrips.length}</Box>
          </Box>
        </Paper>

        <Box className={styles.workspaceLayout}>
          <Box className={styles.sidebarColumn}>
            <CollapsibleSidebar
              title="Near East Ulasim"
              subtitle={`${roleConfig[role].label} · ${roleConfig[role].subtitle}`}
              items={visibleMenuItems.map((item) => ({ label: item.label, href: `#${item.key}`, key: item.key }))}
              active={activeSection}
              onLogout={onLogout}
              showLogout={false}
            />
          </Box>

          <Box className={styles.contentColumn}>
            <Paper elevation={0} className={styles.topBar}>
              <Box className={styles.topBarMainRow}>
                <Box className={styles.topBarLeft}>
                  <Box>
                    <Typography className={styles.topBarEyebrow}>Dashboard</Typography>
                    <Typography className={styles.topBarTitle}>Sefer Yönetimi</Typography>
                  </Box>
                </Box>

                <Box className={styles.topSearchWrap}>
                  <SearchRoundedIcon className={styles.topSearchIcon} />
                  <TextField
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Sefer, firma, rota ara..."
                    variant="standard"
                    fullWidth
                    slotProps={{ input: { disableUnderline: true } }}
                  />
                </Box>

                <Box className={styles.topUtilityActions}>
                  <Button className={styles.utilityIconButton}>
                    <HelpOutlineRoundedIcon fontSize="small" />
                  </Button>
                  <Button className={styles.utilityIconButton}>
                    <NotificationsNoneRoundedIcon fontSize="small" />
                  </Button>
                  <Button className={styles.utilityIconButton}>
                    <TuneRoundedIcon fontSize="small" />
                  </Button>
                </Box>
              </Box>

              <Box className={styles.topBarLeft}> 
                <Box>
                  <Typography className={styles.topBarSubtitle}>Tek panelden rol bazli yonetim</Typography>
                </Box>
              </Box>

              <Box className={styles.topBarActions}>
                <TextField select size="small" value={selectedCompany} onChange={(event) => onCompanyChange(event.target.value)} className={styles.topSelect} label="Firma">
                  <MenuItem value="all">Tüm şirketler</MenuItem>
                  {companyOptions
                    .filter((company) => company !== "all")
                    .map((company) => (
                      <MenuItem key={company} value={company}>
                        {company}
                      </MenuItem>
                    ))}
                </TextField>

                <TextField select size="small" value={role} onChange={(event) => onRoleChange(event.target.value as AdminRole)} className={styles.topSelect} label="Rol">
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Button component="a" href="#trips" variant="contained" disableElevation className={styles.createButton} startIcon={<AddCircleOutlineOutlinedIcon />}>
                  Sefer Oluştur
                </Button>

                <Box className={styles.profilePill}>
                  <AccountCircleOutlinedIcon className={styles.profileIcon} />
                  <Box>
                    <Typography className={styles.profileName}>{username}</Typography>
                    <Typography className={styles.profileRole}>Yönetim Paneli</Typography>
                  </Box>
                  <KeyboardArrowDownRoundedIcon className={styles.profileChevron} />
                </Box>

                <Button onClick={onLogout} variant="outlined" className={styles.logoutButton}>
                  Çıkış Yap
                </Button>
              </Box>
            </Paper>

            <Paper id="overview" elevation={0} className={styles.heroCard}>
              <Box className={styles.heroHeader}>
                <Box>
                  <Typography className={styles.pageTitle}>Seferler</Typography>
                  <Typography className={styles.pageSubtitle}>Toplam {filteredTrips.length} sefer</Typography>
                </Box>
                <Box className={styles.heroMetaPill}>
                  <FilterAltOutlinedIcon className={styles.heroMetaIcon} />
                  {roleConfig[role].label}
                </Box>
              </Box>

              <Box className={styles.metricGrid}>
                {metrics.map((item) => (
                  <Paper key={item.label} elevation={0} className={styles.metricCard}>
                    <Box className={styles.metricAccent} sx={{ backgroundColor: item.tone }} />
                    <Typography className={styles.metricLabel}>{item.label}</Typography>
                    <Typography className={styles.metricValue}>{item.value}</Typography>
                    <Typography className={styles.metricHint}>{item.hint}</Typography>
                  </Paper>
                ))}
              </Box>

              {info ? <Typography className={styles.infoText}>{info}</Typography> : null}
            </Paper>

            <Paper id="trips" elevation={0} className={styles.pageCard}>
              <Box className={styles.sectionHeader}>
                <Box>
                  <Typography className={styles.sectionTitle}>Sefer Yönetimi</Typography>
                  <Typography className={styles.sectionSubtitle}>Kalkış, varış ve tarih bazlı sefer sonuçları</Typography>
                </Box>

                <Box className={styles.filterRow}>
                  {filterButtons.map((button) => {
                    const selected = filterWindow === button.value;
                    return (
                      <Button
                        key={button.value}
                        onClick={() => setFilterWindow(button.value)}
                        variant={selected ? "contained" : "outlined"}
                        disableElevation
                        className={selected ? styles.filterButtonActive : styles.filterButton}
                      >
                        {button.label}
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              <Paper elevation={0} className={styles.searchPanel}>
                <SearchRoundedIcon className={styles.searchIcon} />
                <TextField value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Sefer no, lokasyon, şoför, plaka ara..." variant="outlined" size="small" fullWidth />
              </Paper>

              <Box className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Sefer No</th>
                      <th>Kalkış</th>
                      <th>Varış</th>
                      <th>Yön</th>
                      <th>Tarih</th>
                      <th>Saat</th>
                      <th>Şoför</th>
                      <th>Plaka</th>
                      <th>İrtibat</th>
                      <th>Tel</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((trip) => (
                      <tr key={trip.id}>
                        <td>
                          <Box className={styles.tripNo}>{trip.tripCode ?? trip.id}</Box>
                        </td>
                        <td className={styles.tableCellStrong}>{trip.from}</td>
                        <td className={styles.tableCellStrong}>{trip.to}</td>
                        <td>
                          <Box className={styles.directionBadge}>
                            <Typography className={styles.directionBadgeTitle}>{getDirectionLabel(trip)}</Typography>
                            <Typography className={styles.directionBadgeMeta}>↔ Bağlı</Typography>
                          </Box>
                        </td>
                        <td>{trip.departureDate}</td>
                        <td>{trip.departureTime}</td>
                        <td className={styles.tableMuted}>Atanmadı</td>
                        <td className={styles.tableMuted}>Atanmadı</td>
                        <td className={styles.tableCellStrong}>{trip.company}</td>
                        <td>0000000000</td>
                        <td>
                          <Box className={styles.statusBadge}>{getTripStatusLabel(trip)}</Box>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Paper>

            {roleConfig[role].allowedSections.includes("requests") ? (
              <Paper id="requests" elevation={0} className={styles.pageCard}>
                <Box className={styles.sectionHeader}>
                  <Box>
                    <Typography className={styles.sectionTitle}>Bekleyen Firma Başvuruları</Typography>
                    <Typography className={styles.sectionSubtitle}>Rol bazlı görünürlük ile tek panelden onay akışı</Typography>
                  </Box>
                  <Box className={styles.sectionPill}>
                    <AssignmentTurnedInOutlinedIcon className={styles.sectionPillIcon} />
                    {requests.length} başvuru
                  </Box>
                </Box>

                {!requests.length ? <Typography className={styles.emptyText}>Bekleyen başvuru yok.</Typography> : null}
                <Box className={styles.requestGrid}>
                  {requests.map((request) => (
                    <Paper key={request.id} elevation={0} className={styles.requestCard}>
                      <Typography className={styles.requestTitle}>{request.companyName}</Typography>
                      <Typography className={styles.requestMeta}>Yetkili: {request.contactName}</Typography>
                      <Typography className={styles.requestMeta}>E-posta: {request.email}</Typography>
                      <Button onClick={() => void onApprove(request.id)} variant="contained" disableElevation className={styles.approveButton}>
                        Onayla
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Paper>
            ) : null}

            {roleConfig[role].allowedSections.includes("users") ? (
              <Paper id="users" elevation={0} className={styles.pageCard}>
                <Box className={styles.sectionHeader}>
                  <Box>
                    <Typography className={styles.sectionTitle}>Kullanıcı Yönetimi</Typography>
                    <Typography className={styles.sectionSubtitle}>Rol bazlı erişim katmanı aktif</Typography>
                  </Box>
                  <Box className={styles.sectionPill}>
                    <GroupOutlinedIcon className={styles.sectionPillIcon} />
                    Erişim kontrollü
                  </Box>
                </Box>

                <Box className={styles.infoGrid}>
                  <Paper elevation={0} className={styles.infoCard}>
                    <Typography className={styles.infoCardTitle}>Yönetici rolü</Typography>
                    <Typography className={styles.infoCardText}>{roleConfig[role].label}</Typography>
                  </Paper>
                  <Paper elevation={0} className={styles.infoCard}>
                    <Typography className={styles.infoCardTitle}>Görünür menü</Typography>
                    <Typography className={styles.infoCardText}>{visibleMenuItems.length} bölüm</Typography>
                  </Paper>
                  <Paper elevation={0} className={styles.infoCard}>
                    <Typography className={styles.infoCardTitle}>Oturum</Typography>
                    <Typography className={styles.infoCardText}>Token aktif</Typography>
                  </Paper>
                </Box>
              </Paper>
            ) : null}

            {roleConfig[role].allowedSections.includes("reports") ? (
              <Paper id="reports" elevation={0} className={styles.pageCard}>
                <Box className={styles.sectionHeader}>
                  <Box>
                    <Typography className={styles.sectionTitle}>Raporlar</Typography>
                    <Typography className={styles.sectionSubtitle}>Gelir ve rota özetleri</Typography>
                  </Box>
                  <Box className={styles.sectionPill}>
                    <QueryStatsOutlinedIcon className={styles.sectionPillIcon} />
                    Özet görünüm
                  </Box>
                </Box>

                <Box className={styles.reportGrid}>
                  {(overview?.revenueTrend ?? []).slice(-3).map((trend) => (
                    <Paper key={trend.month} elevation={0} className={styles.reportCard}>
                      <Typography className={styles.reportLabel}>{trend.month}</Typography>
                      <Typography className={styles.reportValue}>{formatCurrency(trend.value)}</Typography>
                    </Paper>
                  ))}
                  {(overview?.popularRoutes ?? []).slice(0, 3).map((route) => (
                    <Paper key={route.label} elevation={0} className={styles.reportCard}>
                      <Typography className={styles.reportLabel}>{route.label}</Typography>
                      <Typography className={styles.reportValue}>{route.value}%</Typography>
                    </Paper>
                  ))}
                </Box>
              </Paper>
            ) : null}

            {roleConfig[role].allowedSections.includes("settings") ? (
              <Paper id="settings" elevation={0} className={styles.pageCard}>
                <Box className={styles.sectionHeader}>
                  <Box>
                    <Typography className={styles.sectionTitle}>Ayarlar</Typography>
                    <Typography className={styles.sectionSubtitle}>Rol ve görüntü ayarlarını bu panelden değiştirebilirsiniz.</Typography>
                  </Box>
                  <Box className={styles.sectionPill}>
                    <SettingsOutlinedIcon className={styles.sectionPillIcon} />
                    {roleConfig[role].subtitle}
                  </Box>
                </Box>

                <Box className={styles.settingsGrid}>
                  <Paper elevation={0} className={styles.infoCard}>
                    <Typography className={styles.infoCardTitle}>Panel rolü</Typography>
                    <TextField select size="small" value={role} onChange={(event) => onRoleChange(event.target.value as AdminRole)} fullWidth>
                      {roleOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Paper>
                  <Paper elevation={0} className={styles.infoCard}>
                    <Typography className={styles.infoCardTitle}>Hızlı erişim</Typography>
                    <Button component="a" href="#trips" variant="outlined" className={styles.outlineButton}>
                      Seferlere git
                    </Button>
                  </Paper>
                  <Paper elevation={0} className={styles.infoCard}>
                    <Typography className={styles.infoCardTitle}>Oturum</Typography>
                    <Button onClick={onLogout} variant="contained" disableElevation className={styles.approveButton}>
                      Çıkış Yap
                    </Button>
                  </Paper>
                </Box>
              </Paper>
            ) : null}

            <Box className={styles.footerNote}>
              <CalendarTodayOutlinedIcon className={styles.footerIcon} />
              Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}