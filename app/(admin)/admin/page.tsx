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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Tooltip,
  LinearProgress,
  Badge,
  Menu,
} from "@mui/material";
import {
  AddCircleOutlineOutlined as AddCircleOutlineOutlinedIcon,
  AssignmentTurnedInOutlined as AssignmentTurnedInOutlinedIcon,
  FilterAltOutlined as FilterAltOutlinedIcon,
  GroupOutlined as GroupOutlinedIcon,
  NotificationsNoneRounded as NotificationsNoneRoundedIcon,
  QueryStatsOutlined as QueryStatsOutlinedIcon,
  SearchRounded as SearchRoundedIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  HomeOutlined as HomeOutlinedIcon,
  DirectionsBusOutlined as DirectionsBusOutlinedIcon,
  RouteOutlined as RouteOutlinedIcon,
  DirectionsCarOutlined as VehicleIcon,
  EventSeatOutlined as SeatIcon,
  ReceiptOutlined as ReceiptIcon,
  LogoutOutlined as LogoutIcon,
  RefreshOutlined as RefreshIcon,
  DownloadOutlined as DownloadIcon,
  TrendingUpOutlined as TrendingUpIcon,
  TrendingDownOutlined as TrendingDownIcon,
  MapOutlined as MapOutlinedIcon,
  MoreVert as MoreVertIcon,
  EditOutlined as EditIcon,
  DeleteOutlineOutlined as DeleteIcon,
  CheckCircleOutlined as CheckCircleIcon,
  CancelOutlined as CancelIcon,
  PendingOutlined as PendingIcon,
  LocalOfferOutlined as OfferIcon,
  SpeedOutlined as SpeedIcon,
  AttachMoneyOutlined as MoneyIcon,
  PeopleOutlined as PeopleIcon,
  LocationOnOutlined as LocationIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

import { apiGet, apiRequest } from "@/lib/api";
import { clearStoredUser } from "@/lib/session";
import { CYPRUS_CITIES } from "@/lib/cities";

type AdminOverviewResponse = {
  metrics: {
    totalBookings: number;
    activeUsers: number;
    busRoutes: number;
    revenue: number;
  };
  recentBookings?: AdminTrip[];
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

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isCompany: boolean;
  createdAt: string;
};

type AdminUsersResponse = {
  ok: boolean;
  users?: AdminUser[];
  message?: string;
};

type RevenueReportResponse = {
  ok: boolean;
  summary?: {
    totalRevenue: number;
    totalBookings: number;
    averageTicket: number;
  };
  byPeriod?: Array<{ label?: string; month?: string; value: number }>;
  message?: string;
};

type RouteReportItem = {
  route: string;
  bookings: number;
  revenue: number;
  passengers: number;
};

type CompanyReportItem = {
  companyId: string;
  name: string;
  trips: number;
  bookings: number;
  passengers: number;
  revenue: number;
  vehicleCount: number;
  routes: Array<{
    route: string;
    price: number;
    bookings: number;
    passengers: number;
    vehicle: string;
  }>;
};

type AdminCompany = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  status: string;
  createdAt: string;
  approvedAt?: string;
};

type AdminTrip = {
  id: string;
  tripCode?: string;
  company: string;
  companyId?: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  price: number;
  isActive?: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
};

type AdminRoute = {
  from: string;
  to: string;
  basePrice: number;
  durationMinutes: number;
};

type AdminVehicle = {
  id: string;
  companyId: string;
  plate: string;
  busType: string;
  seatsTotal: number;
  seatLayout: "2+2" | "2+1" | "1+1";
  seatRows: number;
  createdAt: string;
};

type AdminRole = "super-admin" | "company-admin";
type FilterWindow = "all" | "today" | "two-days" | "week";
type AdminSection =
  | "overview"
  | "trips"
  | "requests"
  | "users"
  | "reports"
  | "settings"
  | "route-management"
  | "companies"
  | "vehicles";

const ROLE_STORAGE_KEY = "admin_role";
const DRAWER_WIDTH = 250;

const roleConfig: Record<
  AdminRole,
  { label: string; allowedSections: AdminSection[] }
> = {
  "super-admin": {
    label: "Sistem Yöneticisi",
    allowedSections: [
      "overview",
      "trips",
      "route-management",
      "vehicles",
      "requests",
      "users",
      "reports",
      "companies",
      "settings",
    ],
  },
  "company-admin": {
    label: "Firma Yetkilisi",
    allowedSections: [
      "overview",
      "trips",
      "route-management",
      "vehicles",
      "settings",
    ],
  },
};

const sectionConfig: Array<{
  key: AdminSection;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: "overview", label: "Dashboard", icon: <HomeOutlinedIcon /> },
  {
    key: "trips",
    label: "Sefer Yönetimi",
    icon: <DirectionsBusOutlinedIcon />,
  },
  { key: "vehicles", label: "Araç Yönetimi", icon: <VehicleIcon /> },
  {
    key: "requests",
    label: "Başvurular",
    icon: <AssignmentTurnedInOutlinedIcon />,
  },
  { key: "companies", label: "Firmalar", icon: <GroupOutlinedIcon /> },
  { key: "users", label: "Kullanıcılar", icon: <GroupOutlinedIcon /> },
  { key: "reports", label: "Raporlar", icon: <QueryStatsOutlinedIcon /> },
  { key: "settings", label: "Ayarlar", icon: <SettingsOutlinedIcon /> },
  {
    key: "route-management",
    label: "Rota Yönetimi",
    icon: <MapOutlinedIcon />,
  },
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
  const d = new Date(dateString + "T12:00:00");
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AdminPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [role, setRole] = useState<AdminRole>("super-admin");
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWindow, setFilterWindow] = useState<FilterWindow>("all");
  const [selectedCompany, setSelectedCompany] = useState("all");

  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [revenueReport, setRevenueReport] =
    useState<RevenueReportResponse | null>(null);
  const [routeReport, setRouteReport] = useState<RouteReportItem[]>([]);
  const [companyReport, setCompanyReport] = useState<CompanyReportItem[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [routes, setRoutes] = useState<AdminRoute[]>([]);
  const [routeStatus, setRouteStatus] = useState("");
  const [companyStatus, setCompanyStatus] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState("");
  const [newCompanyValues, setNewCompanyValues] = useState({
    companyName: "",
    contactName: "",
    email: "",
    password: "",
  });
  const [newVehicleValues, setNewVehicleValues] = useState({
    plate: "",
    busType: "",
    seatsTotal: "40",
    seatLayout: "2+2" as "2+2" | "2+1" | "1+1",
  });
  const [newRouteValues, setNewRouteValues] = useState({
    from: "",
    to: "",
    basePrice: "",
    durationMinutes: "",
  });
  const [adminDataLoading, setAdminDataLoading] = useState(true);
  const [newTripOpen, setNewTripOpen] = useState(false);
  const [tripStatus, setTripStatus] = useState("");
  const [newTripValues, setNewTripValues] = useState({
    companyId: "",
    vehicleId: "",
    from: "",
    to: "",
    departureDate: "",
    departureTime: "",
    price: "",
  });
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editUserData, setEditUserData] = useState<AdminUser | null>(null);
  const [editUserValues, setEditUserValues] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [editUserStatus, setEditUserStatus] = useState("");
  const [pendingTrips, setPendingTrips] = useState<AdminTrip[]>([]);
  const [tripApprovalStatus, setTripApprovalStatus] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("admin_token") ?? "");
    const storedRole = localStorage.getItem(
      ROLE_STORAGE_KEY,
    ) as AdminRole | null;
    if (storedRole && roleConfig[storedRole]) setRole(storedRole);
  }, []);

  useEffect(() => {
    if (!token) return;
    if (activeSection === "trips" && role === "super-admin") {
      void fetchPendingTrips();
    }
  }, [token, activeSection, role]);

  useEffect(() => {
    if (!token) return;
    async function loadData() {
      setAdminDataLoading(true);
      try {
        const encodedToken = encodeURIComponent(token);
        const [
          overviewData,
          tripData,
          usersData,
          revenueData,
          routesData,
          routeListData,
          companiesData,
          companyStats,
          vehiclesData,
        ] = await Promise.all([
          apiGet<AdminOverviewResponse>("/admin/overview").catch(() => null),
          apiGet<{ ok: boolean; trips?: AdminTrip[] }>(
            "/admin/trips?token=" + encodedToken,
          ).catch(() => null),
          apiGet<AdminUsersResponse>(
            "/admin/users?token=" +
              encodedToken +
              "&page=1&limit=8&sortBy=createdAt&sortOrder=desc",
          ).catch(() => null),
          apiGet<RevenueReportResponse>(
            "/admin/reports/revenue?token=" + encodedToken + "&period=monthly",
          ).catch(() => null),
          apiGet<{ ok: boolean; routes?: RouteReportItem[] }>(
            "/admin/reports/routes?token=" + encodedToken,
          ).catch(() => null),
          apiGet<{ ok: boolean; routes?: AdminRoute[] }>(
            "/admin/routes?token=" + encodedToken,
          ).catch(() => null),
          apiGet<{ ok: boolean; companies?: AdminCompany[] }>(
            "/admin/companies?token=" + encodedToken,
          ).catch(() => null),
          apiGet<{ ok: boolean; companies?: CompanyReportItem[] }>(
            "/admin/reports/companies?token=" + encodedToken,
          ).catch(() => null),
          apiGet<{ ok: boolean; vehicles?: AdminVehicle[] }>(
            "/admin/vehicles?token=" + encodedToken,
          ).catch(() => null),
        ]);
        if (overviewData) setOverview(overviewData);
        if (tripData?.ok && tripData.trips) setTrips(tripData.trips);
        if (usersData?.ok && usersData.users) setAdminUsers(usersData.users);
        if (revenueData?.ok) setRevenueReport(revenueData);
        if (routesData?.ok && routesData.routes)
          setRouteReport(routesData.routes);
        if (routeListData?.ok && routeListData.routes)
          setRoutes(routeListData.routes);
        if (companiesData?.ok && companiesData.companies)
          setCompanies(companiesData.companies);
        if (companyStats?.ok && companyStats.companies)
          setCompanyReport(companyStats.companies);
        if (vehiclesData?.ok && vehiclesData.vehicles)
          setVehicles(vehiclesData.vehicles);
        const reqData = await apiGet<{
          ok: boolean;
          requests?: CompanyRequest[];
        }>("/admin/company-requests?token=" + encodedToken).catch(() => null);
        if (reqData?.ok && reqData.requests) setRequests(reqData.requests);
      } catch (err) {
        console.error(err);
      } finally {
        setAdminDataLoading(false);
      }
    }
    loadData();
  }, [token]);

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    try {
      const result = await apiRequest<{
        ok: boolean;
        token?: string;
        message?: string;
        role?: AdminRole;
      }>("/admin/login", "POST", { username, password, role });
      if (!result.ok || !result.token)
        return setLoginError(result.message ?? "Giriş başarısız.");
      localStorage.setItem("admin_token", result.token);
      document.cookie = `admin_token=${result.token}; path=/; max-age=86400`;
      localStorage.setItem(ROLE_STORAGE_KEY, result.role ?? role);
      setToken(result.token);
      setRole(result.role ?? role);
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Sunucu bağlantı hatası.",
      );
    }
  }

  function onLogout() {
    localStorage.removeItem("admin_token");
    document.cookie = `admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    localStorage.removeItem(ROLE_STORAGE_KEY);
    setToken("");
    setTrips([]);
    setRequests([]);
    setOverview(null);
    setAdminUsers([]);
    setRevenueReport(null);
    setRouteReport([]);
    setRoutes([]);
    setCompanyReport([]);
    setCompanies([]);
    setVehicles([]);
  }

  async function onApprove(companyId: string) {
    const res = await apiRequest<{ ok: boolean }>(
      `/admin/company-requests/${companyId}/approve`,
      "PATCH",
      { token },
    );
    if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== companyId));
  }

  async function onCreateTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTripStatus("");

    if (
      !newTripValues.from ||
      !newTripValues.to ||
      !newTripValues.departureDate ||
      !newTripValues.departureTime ||
      !newTripValues.price ||
      !newTripValues.vehicleId
    ) {
      setTripStatus("Lütfen tüm sefer bilgilerini doldurun.");
      return;
    }

    if (newTripValues.from === newTripValues.to) {
      setTripStatus("Nereden ve nereye şehirleri aynı olamaz.");
      return;
    }

    if (role === "super-admin" && !newTripValues.companyId) {
      setTripStatus("Lütfen firma seçin.");
      return;
    }

    const selectedCompany = companies.find(
      (item) => item.id === newTripValues.companyId,
    );
    const selectedVehicle = vehicles.find(
      (item) => item.id === newTripValues.vehicleId,
    );

    if (!selectedVehicle) {
      setTripStatus("Seçilen araç bulunamadı.");
      return;
    }

    try {
      const result = await apiRequest<{
        ok: boolean;
        trip?: AdminTrip;
        message?: string;
      }>("/admin/trips", "POST", {
        token,
        trip: {
          ...(selectedCompany
            ? {
                companyId: selectedCompany.id,
                company: selectedCompany.companyName,
              }
            : {}),
          vehicleId: selectedVehicle.id,
          from: newTripValues.from,
          to: newTripValues.to,
          departureDate: newTripValues.departureDate,
          departureTime: newTripValues.departureTime,
          price: Number(newTripValues.price),
          busType: selectedVehicle.busType,
          seatLayout: selectedVehicle.seatLayout,
          seatsTotal: selectedVehicle.seatsTotal,
        },
      });

      if (!result.ok) {
        setTripStatus(result.message ?? "Sefer oluşturulamadı.");
        return;
      }

      if (result.trip) {
        setTrips((prev) => [result.trip!, ...prev]);
      }
      setTripStatus("Sefer başarıyla oluşturuldu.");
      setNewTripValues({
        companyId: "",
        vehicleId: "",
        from: "",
        to: "",
        departureDate: "",
        departureTime: "",
        price: "",
      });
      setNewTripOpen(false);
    } catch {
      setTripStatus("Sefer oluşturulamadı. Lütfen tekrar deneyin.");
    }
  }

  async function onDeleteTrip(tripId: string) {
    const confirmed = window.confirm(
      "Bu seferi silmek istediğinizden emin misiniz?",
    );
    if (!confirmed) return;
    try {
      const result = await apiRequest<{ ok: boolean; message?: string }>(
        `/admin/trips/${tripId}`,
        "DELETE",
        { token },
      );
      if (result.ok) {
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
      } else {
        alert(result.message ?? "Sefer silinemedi.");
      }
    } catch {
      alert("Sefer silinirken hata oluştu.");
    }
  }

  async function onDeleteUser(userId: string) {
    const confirmed = window.confirm(
      "Bu kullanıcıyı silmek istediğinizden emin misiniz?",
    );
    if (!confirmed) return;

    try {
      const result = await apiRequest<{ ok: boolean; message?: string }>(
        "/admin/users/delete",
        "POST",
        { token, userId },
      );

      if (!result.ok) {
        alert(result.message ?? "Kullanıcı silinemedi.");
        return;
      }

      setAdminUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch {
      alert("Kullanıcı silinirken hata oluştu.");
    }
  }

  function openEditUser(user: AdminUser) {
    setEditUserData(user);
    setEditUserValues({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    setEditUserStatus("");
    setEditUserOpen(true);
  }

  async function onUpdateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editUserData) return;

    setEditUserStatus("");
    try {
      const result = await apiRequest<{
        ok: boolean;
        user?: AdminUser;
        message?: string;
      }>(`/admin/users/${editUserData.id}`, "PATCH", {
        token,
        userId: editUserData.id,
        name: editUserValues.name,
        email: editUserValues.email,
        phone: editUserValues.phone,
      });

      if (!result.ok) {
        setEditUserStatus(result.message ?? "Kullanıcı güncellenemedi.");
        return;
      }

      if (result.user) {
        setAdminUsers((prev) =>
          prev.map((u) => (u.id === result.user!.id ? result.user! : u)),
        );
      }
      setEditUserStatus("Kullanıcı başarıyla güncellendi.");
      setTimeout(() => {
        setEditUserOpen(false);
        setEditUserStatus("");
      }, 1500);
    } catch {
      setEditUserStatus("Kullanıcı güncellenirken hata oluştu.");
    }
  }

  async function fetchPendingTrips() {
    if (role !== "super-admin") return;
    try {
      const result = await apiGet<{ ok: boolean; trips?: AdminTrip[] }>(
        `/admin/trips/pending?token=${encodeURIComponent(token)}`,
      );
      if (result?.ok && result.trips) {
        setPendingTrips(result.trips);
      }
    } catch {
      console.error("Onay bekleyen seferler yüklenemedi");
    }
  }

  async function onApproveTrip(
    tripId: string,
    status: "approved" | "rejected",
  ) {
    setTripApprovalStatus("");
    try {
      const result = await apiRequest<{
        ok: boolean;
        trip?: AdminTrip;
        message?: string;
      }>(`/admin/trips/${tripId}/approve`, "PATCH", { token, status });
      if (!result.ok) {
        setTripApprovalStatus(result.message ?? "İşlem başarısız.");
        return;
      }
      // Remove from pending list
      setPendingTrips((prev) => prev.filter((t) => t.id !== tripId));
      // Add to trips list if approved
      if (status === "approved" && result.trip) {
        setTrips((prev) => [result.trip!, ...prev]);
      }
      setTripApprovalStatus(
        status === "approved" ? "Sefer onaylandı." : "Sefer reddedildi.",
      );
      setTimeout(() => setTripApprovalStatus(""), 2000);
    } catch {
      setTripApprovalStatus("İşlem sırasında hata oluştu.");
    }
  }

  async function onCreateRoute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRouteStatus("");

    if (
      !newRouteValues.from ||
      !newRouteValues.to ||
      !newRouteValues.basePrice ||
      !newRouteValues.durationMinutes
    ) {
      setRouteStatus("Lütfen rota için tüm alanları doldurun.");
      return;
    }

    if (newRouteValues.from === newRouteValues.to) {
      setRouteStatus("Nereden ve nereye şehirleri aynı olamaz.");
      return;
    }

    const payload = {
      from: newRouteValues.from.trim(),
      to: newRouteValues.to.trim(),
      basePrice: Number(newRouteValues.basePrice),
      durationMinutes: Number(newRouteValues.durationMinutes),
    };

    try {
      const result = await apiRequest<{
        ok: boolean;
        route?: AdminRoute;
        message?: string;
      }>("/admin/routes", "POST", { token, route: payload });

      if (!result.ok) {
        setRouteStatus(result.message ?? "Rota oluşturulamadı.");
        return;
      }

      setRouteStatus("Rota başarıyla eklendi.");
      if (result.route) {
        setRoutes((prev) => [...prev, result.route as AdminRoute]);
      }
      setNewRouteValues({
        from: "",
        to: "",
        basePrice: "",
        durationMinutes: "",
      });
    } catch {
      setRouteStatus("Rota oluşturulurken bir hata oluştu.");
    }
  }

  async function onDeleteRoute(routeIndex: number) {
    const confirmed = window.confirm(
      "Bu rotayı silmek istediğinizden emin misiniz?",
    );
    if (!confirmed) {
      return;
    }

    try {
      const result = await apiRequest<{ ok: boolean; message?: string }>(
        `/admin/routes/${routeIndex}`,
        "DELETE",
        { token },
      );

      if (!result.ok) {
        setRouteStatus(result.message ?? "Rota silinemedi.");
        return;
      }

      setRoutes((prev) => prev.filter((_, idx) => idx !== routeIndex));
      setRouteStatus("Rota silindi.");
    } catch {
      setRouteStatus("Rota silinirken bir hata oluştu.");
    }
  }

  async function onCreateCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompanyStatus("");

    if (
      !newCompanyValues.companyName ||
      !newCompanyValues.contactName ||
      !newCompanyValues.email
    ) {
      setCompanyStatus("Firma adı, yetkili ve e-posta zorunludur.");
      return;
    }

    try {
      const result = await apiRequest<{
        ok: boolean;
        company?: AdminCompany;
        message?: string;
      }>("/admin/companies", "POST", {
        token,
        company: {
          companyName: newCompanyValues.companyName,
          contactName: newCompanyValues.contactName,
          email: newCompanyValues.email,
          password: newCompanyValues.password || undefined,
        },
      });

      if (!result.ok || !result.company) {
        setCompanyStatus(result.message ?? "Firma eklenemedi.");
        return;
      }

      setCompanies((prev) => [result.company!, ...prev]);
      setCompanyStatus("Firma başarıyla eklendi.");
      setNewCompanyValues({
        companyName: "",
        contactName: "",
        email: "",
        password: "",
      });
    } catch {
      setCompanyStatus("Firma eklenirken hata oluştu.");
    }
  }

  async function onDeleteCompany(companyId: string) {
    const confirmed = window.confirm(
      "Bu firmayı silmek istediğinizden emin misiniz?",
    );
    if (!confirmed) return;

    try {
      const result = await apiRequest<{ ok: boolean; message?: string }>(
        "/admin/companies/delete",
        "POST",
        { token, companyId },
      );

      if (!result.ok) {
        setCompanyStatus(result.message ?? "Firma silinemedi.");
        return;
      }

      setCompanies((prev) => prev.filter((item) => item.id !== companyId));
      setCompanyStatus("Firma silindi.");
    } catch {
      setCompanyStatus("Firma silinirken hata oluştu.");
    }
  }

  async function onCreateVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVehicleStatus("");

    if (
      !newVehicleValues.plate ||
      !newVehicleValues.busType ||
      !newVehicleValues.seatsTotal
    ) {
      setVehicleStatus("Plaka, araç tipi ve koltuk sayısı zorunludur.");
      return;
    }

    try {
      const result = await apiRequest<{
        ok: boolean;
        vehicle?: AdminVehicle;
        message?: string;
      }>("/admin/vehicles", "POST", {
        token,
        vehicle: {
          plate: newVehicleValues.plate,
          busType: newVehicleValues.busType,
          seatsTotal: Number(newVehicleValues.seatsTotal),
          seatLayout: newVehicleValues.seatLayout,
        },
      });

      if (!result.ok || !result.vehicle) {
        setVehicleStatus(result.message ?? "Araç eklenemedi.");
        return;
      }

      setVehicles((prev) => [result.vehicle!, ...prev]);
      setVehicleStatus("Araç başarıyla eklendi.");
      setNewVehicleValues({
        plate: "",
        busType: "",
        seatsTotal: "40",
        seatLayout: "2+2",
      });
    } catch {
      setVehicleStatus("Araç eklenirken hata oluştu.");
    }
  }

  async function onDeleteVehicle(vehicleId: string) {
    const confirmed = window.confirm(
      "Bu aracı silmek istediğinizden emin misiniz?",
    );
    if (!confirmed) return;

    try {
      const result = await apiRequest<{ ok: boolean; message?: string }>(
        `/admin/vehicles/${vehicleId}`,
        "DELETE",
        { token },
      );
      if (!result.ok) {
        setVehicleStatus(result.message ?? "Araç silinemedi.");
        return;
      }
      setVehicles((prev) => prev.filter((item) => item.id !== vehicleId));
      setVehicleStatus("Araç silindi.");
    } catch {
      setVehicleStatus("Araç silinirken hata oluştu.");
    }
  }

  const companyOptions = useMemo(() => {
    const companies = Array.from(
      new Set(trips.map((t) => t.company).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b, "tr"));
    return ["all", ...companies];
  }, [trips]);

  const approvedCompanyOptions = useMemo(
    () => companies.filter((company) => company.status === "approved"),
    [companies],
  );

  const tripVehicleOptions = useMemo(() => {
    if (role === "super-admin") {
      if (!newTripValues.companyId) {
        return [] as AdminVehicle[];
      }
      return vehicles.filter(
        (vehicle) => vehicle.companyId === newTripValues.companyId,
      );
    }

    return vehicles;
  }, [newTripValues.companyId, role, vehicles]);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const companyMatch =
        selectedCompany === "all" || trip.company === selectedCompany;
      const term = normalize(searchTerm);
      const searchable = normalize(
        [trip.id, trip.tripCode ?? "", trip.company, trip.from, trip.to].join(
          " ",
        ),
      );
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

  const visibleMenuItems = sectionConfig.filter((item) =>
    roleConfig[role].allowedSections.includes(item.key),
  );

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 5,
            maxWidth: 420,
            width: "100%",
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              bgcolor: "#002D62",
              borderRadius: 1,
              mx: "auto",
              mb: 2,
            }}
          />
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, mb: 0.5, color: "#0f172a" }}
          >
            Near East Way Yönetim
          </Typography>
          <Typography sx={{ color: "#64748b", mb: 4, fontSize: "0.9rem" }}>
            Kurumsal sisteme giriş yapın
          </Typography>
          <Box
            component="form"
            onSubmit={onLogin}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              fullWidth
              label={
                role === "company-admin" ? "Firma E-posta" : "Kullanıcı Adı"
              }
              placeholder={
                role === "company-admin" ? "ornek@firma.com" : "admin"
              }
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <TextField
              fullWidth
              select
              label="Erişim Yetkisi"
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
            >
              {roleOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && (
              <Typography sx={{ color: "#dc2626", fontSize: "0.85rem" }}>
                {loginError}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              sx={{
                height: 48,
                bgcolor: "#002D62",
                "&:hover": { bgcolor: "#001f44" },
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              Giriş Yap
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Box sx={{ p: 3, pb: 2 }}>
          <Typography
            sx={{
              fontSize: "1.15rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            Near East Way
          </Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#64748b", mt: 0.5 }}>
            Yönetim Portalı
          </Typography>
        </Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <Box sx={{ px: 1.5, pt: 2, pb: 1 }}>
          <Typography
            sx={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#475569",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              px: 1.5,
              mb: 1,
            }}
          >
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
                  bgcolor:
                    activeSection === item.key
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.07)" },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: activeSection === item.key ? "#ffffff" : "#64748b",
                    minWidth: 38,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: "0.9rem",
                        fontWeight: activeSection === item.key ? 600 : 400,
                        color:
                          activeSection === item.key ? "#ffffff" : "#94a3b8",
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            bgcolor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: "#0f172a" }}>
            <MenuIcon />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: 1,
              maxWidth: 380,
            }}
          >
            <SearchRoundedIcon sx={{ color: "#94a3b8" }} />
            <TextField
              variant="standard"
              placeholder="Sefer veya firma ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              slotProps={{
                input: { disableUnderline: true, sx: { fontSize: "0.9rem" } },
              }}
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
                  <MenuItem key={opt} value={opt}>
                    {opt === "all" ? "Tüm Firmalar" : opt}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <IconButton sx={{ color: "#64748b" }}>
              <NotificationsNoneRoundedIcon />
            </IconButton>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                pl: 2,
                borderLeft: "1px solid #e2e8f0",
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#002D62",
                  fontSize: "0.85rem",
                }}
              >
                A
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {username}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>
                    {roleConfig[role].label}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  color="error"
                  onClick={onLogout}
                  sx={{ textTransform: "none", fontWeight: 600, ml: 1 }}
                >
                  Çıkış
                </Button>
              </Box>
            </Box>
          </Box>
        <Box sx={{ p: { xs: 3, md: 4 }, flexGrow: 1 }}>
          {activeSection === "overview" && (
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
              >
                Dashboard
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>
                Sistem genel durumuna genel bakış.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                    xl: "repeat(4, 1fr)",
                  },
                  mb: 4,
                }}
              >
                {[
                  {
                    label: "Toplam Rezervasyon",
                    value: overview?.metrics.totalBookings ?? 0,
                  },
                  {
                    label: "Aktif Müşteri",
                    value: overview?.metrics.activeUsers ?? 0,
                  },
                  {
                    label: "Aktif Rota",
                    value: overview?.metrics.busRoutes ?? 0,
                  },
                  {
                    label: "Toplam Gelir",
                    value: formatCurrency(overview?.metrics.revenue ?? 0),
                  },
                ].map((card) => (
                  <Paper
                    key={card.label}
                    elevation={0}
                    sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#64748b",
                        mb: 1,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.9rem",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 2 }}>
                Son Seferler
              </Typography>
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        ID
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        Firma
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        Güzergah
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        Tarih
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        Fiyat
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(overview?.recentBookings ?? trips)
                      .slice(0, 8)
                      .map((trip, index) => {
                        const anyTrip = trip as AdminTrip & {
                          bookingCode?: string;
                          route?: string;

                          travelDate?: string;
                          totalPrice?: number;
                        };
                        const rowKey =
                          anyTrip.id ??
                          anyTrip.tripCode ??
                          anyTrip.bookingCode ??
                          `${anyTrip.company ?? "unknown"}-${anyTrip.departureDate ?? anyTrip.travelDate ?? "na"}-${index}`;
                        const routeLabel =
                          anyTrip.route ??
                          `${anyTrip.from ?? "-"} → ${anyTrip.to ?? "-"}`;
                        const dateLabel =
                          anyTrip.departureDate ?? anyTrip.travelDate ?? "-";
                        const timeLabel = anyTrip.departureTime ?? "";
                        const amount = anyTrip.price ?? anyTrip.totalPrice ?? 0;

                        return (
                          <TableRow key={rowKey} hover>
                            <TableCell
                              sx={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: "#002D62",
                              }}
                            >
                              {anyTrip.tripCode ??
                                anyTrip.id ??
                                anyTrip.bookingCode ??
                                "-"}
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.85rem" }}>
                              {anyTrip.company ?? "-"}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: "0.85rem", fontWeight: 600 }}
                            >
                              {routeLabel}
                            </TableCell>
                            <TableCell
                              sx={{ fontSize: "0.82rem", color: "#64748b" }}
                            >
                              {dateLabel} {timeLabel}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              ₺{amount}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {(overview?.recentBookings ?? trips).length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{ py: 4, color: "#94a3b8" }}
                        >
                          Henüz sefer kaydı yok.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeSection === "trips" && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
                    >
                      Sefer Yönetimi
                    </Typography>
                    <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>
                      Sistemdeki seferleri listeleyin ve yönetin.
                    </Typography>
                  </Box>
                  {role !== "super-admin" && (
                    <Button
                      variant="contained"
                      startIcon={<AddCircleOutlineOutlinedIcon />}
                      onClick={() => router.push("/admin/create-trip")}
                      sx={{
                        bgcolor: "#002D62",
                        "&:hover": { bgcolor: "#001f44" },
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Yeni Sefer Oluştur
                    </Button>
                  )}
              </Box>

              {role === "super-admin" && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    mb: 3,
                    border: "1px solid #dbe5f3",
                    borderRadius: 2,
                    bgcolor: "#f8fbff",
                  }}
                >
                
                </Paper>
              )}

              {role === "super-admin" && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    border: "1px solid #e2e8f0",
                    borderRadius: 2,
                    bgcolor: "#ffffff",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        Onay Bekleyen Seferler
                      </Typography>
                      {pendingTrips.length > 0 && (
                        <Chip
                          label={pendingTrips.length}
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => void fetchPendingTrips()}
                      sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                      Yenile
                    </Button>
                  </Box>

                  {tripApprovalStatus && (
                    <Alert
                      severity={
                        tripApprovalStatus.includes("onaylandı")
                          ? "success"
                          : "info"
                      }
                      sx={{ mb: 2 }}
                    >
                      {tripApprovalStatus}
                    </Alert>
                  )}

                  {pendingTrips.length === 0 ? (
                    <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>
                      Onay bekleyen sefer bulunmamaktadır.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>
                              Sefer Kodu
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              Firma
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              Güzergah
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              Tarih
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>
                              Fiyat
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                              İşlem
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pendingTrips.map((trip) => (
                            <TableRow key={trip.id} hover>
                              <TableCell sx={{ fontWeight: 600 }}>
                                {trip.tripCode ?? trip.id}
                              </TableCell>
                              <TableCell>{trip.company}</TableCell>
                              <TableCell>
                                {trip.from} → {trip.to}
                              </TableCell>
                              <TableCell>{trip.departureDate}</TableCell>
                              <TableCell>₺{trip.price}</TableCell>
                              <TableCell align="right">
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() =>
                                      void onApproveTrip(trip.id, "approved")
                                    }
                                    sx={{
                                      textTransform: "none",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Onayla
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={() =>
                                      void onApproveTrip(trip.id, "rejected")
                                    }
                                    sx={{
                                      textTransform: "none",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Reddet
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              )}

              <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                {filterButtons.map((btn) => (
                  <Button
                    key={btn.value}
                    size="small"
                    onClick={() => setFilterWindow(btn.value)}
                    variant={
                      filterWindow === btn.value ? "contained" : "outlined"
                    }
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "none",
                      bgcolor:
                        filterWindow === btn.value ? "#0f172a" : "transparent",
                      color: filterWindow === btn.value ? "#fff" : "#64748b",
                      borderColor: "#cbd5e1",
                      "&:hover": { boxShadow: "none" },
                    }}
                  >
                    {btn.label}
                  </Button>
                ))}
              </Box>

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
              >
                <Table sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        Sefer Kodu
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        Firma
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        Güzergah
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        Tarih / Saat
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        Durum
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        Tutar
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "#475569",
                          fontSize: "0.82rem",
                        }}
                      >
                        İşlem
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTrips.map((trip) => (
                      <TableRow key={trip.id} hover>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            color: "#002D62",
                            fontSize: "0.82rem",
                          }}
                        >
                          {trip.tripCode ?? trip.id}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.85rem" }}>
                          {trip.company}
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{ fontSize: "0.85rem", fontWeight: 600 }}
                          >
                            {trip.from} → {trip.to}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: "0.82rem" }}>
                            {trip.departureDate}
                          </Typography>
                          <Typography
                            sx={{ fontSize: "0.75rem", color: "#64748b" }}
                          >
                            {trip.departureTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "inline-block",
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                bgcolor:
                                  trip.approvalStatus === "rejected"
                                    ? "#fee2e2"
                                    : trip.approvalStatus === "pending"
                                      ? "#fef3c7"
                                      : "#dcfce7",
                                color:
                                  trip.approvalStatus === "rejected"
                                    ? "#dc2626"
                                    : trip.approvalStatus === "pending"
                                      ? "#d97706"
                                      : "#16a34a",
                              }}
                            >
                              {trip.approvalStatus === "rejected"
                                ? "Reddedildi"
                                : trip.approvalStatus === "pending"
                                  ? "Onay Bekliyor"
                                  : "Onaylı"}
                            </Box>
                            {trip.isActive === false && (
                              <Box
                                sx={{
                                  display: "inline-block",
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  bgcolor: "#fee2e2",
                                  color: "#dc2626",
                                }}
                              >
                                İptal
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 700, fontSize: "0.9rem" }}
                        >
                          ₺{trip.price}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => void onDeleteTrip(trip.id)}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                          >
                            Sil
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTrips.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          align="center"
                          sx={{ py: 5, color: "#94a3b8" }}
                        >
                          Kriterlere uygun sefer bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeSection === "requests" && (
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
              >
                Firma Başvuruları
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>
                Platforma katılmak isteyen onay bekleyen firmalar.
              </Typography>

              {requests.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: "center",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 2,
                  }}
                >
                  <Typography sx={{ color: "#64748b" }}>
                    Bekleyen başvuru bulunmamaktadır.
                  </Typography>
                </Paper>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "1fr 1fr",
                      lg: "repeat(3, 1fr)",
                    },
                  }}
                >
                  {requests.map((req) => (
                    <Paper
                      key={req.id}
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid #e2e8f0",
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: "1rem", fontWeight: 700, mb: 1 }}
                      >
                        {req.companyName}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.85rem", color: "#64748b", mb: 0.5 }}
                      >
                        Yetkili: {req.contactName}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.85rem", color: "#64748b", mb: 2 }}
                      >
                        İletişim: {req.email}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="success"
                        fullWidth
                        onClick={() => onApprove(req.id)}
                      >
                        Başvuruyu Onayla
                      </Button>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {activeSection === "users" && (
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
              >
                Kullanıcı Yönetimi
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>
                Yolcu kayıtlarını ve müşteri davranışını görüntüleyin.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
                  mb: 4,
                }}
              >
                {[
                  { label: "Kullanıcı", value: adminUsers.length },
                  {
                    label: "Bireysel",
                    value: adminUsers.filter((user) => !user.isCompany).length,
                  },
                  {
                    label: "Firma",
                    value: adminUsers.filter((user) => user.isCompany).length,
                  },
                ].map((card) => (
                  <Paper
                    key={card.label}
                    elevation={0}
                    sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#64748b",
                        mb: 1,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.9rem",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              {adminDataLoading ? (
                <Paper
                  elevation={0}
                  sx={{ p: 4, border: "1px solid #e2e8f0", borderRadius: 2 }}
                >
                  <Typography>Kullanıcı verileri yükleniyor...</Typography>
                </Paper>
              ) : adminUsers.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{ p: 4, border: "1px solid #e2e8f0", borderRadius: 2 }}
                >
                  <Typography>Henüz kullanıcı bulunamadı.</Typography>
                </Paper>
              ) : (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
                >
                  <Table>
                    <TableHead sx={{ bgcolor: "#f8fafc" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Ad</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>E-posta</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Tip</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Kayıt</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          İşlem
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {adminUsers.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {user.name || "Adı yok"}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {user.isCompany ? "Firma" : "Bireysel"}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString(
                              "tr-TR",
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                justifyContent: "flex-end",
                              }}
                            >
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => openEditUser(user)}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                              >
                                Düzenle
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => void onDeleteUser(user.id)}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                              >
                                Sil
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          <Dialog
            open={editUserOpen}
            onClose={() => setEditUserOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ fontWeight: 700 }}>
              Kullanıcı Bilgilerini Düzenle
            </DialogTitle>
            <DialogContent>
              <Box component="form" onSubmit={onUpdateUser} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  label="Ad Soyad"
                  value={editUserValues.name}
                  onChange={(e) =>
                    setEditUserValues({
                      ...editUserValues,
                      name: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="E-posta"
                  type="email"
                  value={editUserValues.email}
                  onChange={(e) =>
                    setEditUserValues({
                      ...editUserValues,
                      email: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                  required
                />
                <TextField
                  fullWidth
                  label="Telefon"
                  value={editUserValues.phone}
                  onChange={(e) =>
                    setEditUserValues({
                      ...editUserValues,
                      phone: e.target.value,
                    })
                  }
                  sx={{ mb: 2 }}
                  placeholder="+90 5XX XXX XX XX"
                />
                {editUserStatus && (
                  <Alert
                    severity={
                      editUserStatus.includes("başarıyla") ? "success" : "error"
                    }
                    sx={{ mb: 2 }}
                  >
                    {editUserStatus}
                  </Alert>
                )}
                <DialogActions>
                  <Button
                    onClick={() => setEditUserOpen(false)}
                    sx={{ textTransform: "none" }}
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ textTransform: "none", fontWeight: 600 }}
                  >
                    Kaydet
                  </Button>
                </DialogActions>
              </Box>
            </DialogContent>
          </Dialog>

          {activeSection === "reports" && (
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
              >
                Raporlar
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>
                Gelir, rota ve şirket performansını backend raporlarıyla
                izleyin.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
                  mb: 4,
                }}
              >
                {[
                  {
                    label: "Toplam gelir",
                    value: formatCurrency(
                      revenueReport?.summary?.totalRevenue ??
                        overview?.metrics.revenue ??
                        0,
                    ),
                  },
                  {
                    label: "Rezervasyon",
                    value:
                      revenueReport?.summary?.totalBookings ??
                      overview?.metrics.totalBookings ??
                      0,
                  },
                  {
                    label: "Ortalama bilet",
                    value: formatCurrency(
                      revenueReport?.summary?.averageTicket ?? 0,
                    ),
                  },
                  {
                    label: "Aktif rota",
                    value:
                      routeReport.length || overview?.metrics.busRoutes || 0,
                  },
                ].map((card) => (
                  <Paper
                    key={card.label}
                    elevation={0}
                    sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#64748b",
                        mb: 1,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                }}
              >
                <Paper
                  elevation={0}
                  sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>
                    Dönemsel Gelir
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {(
                      revenueReport?.byPeriod ??
                      overview?.revenueTrend ??
                      []
                    ).map((item, index) => {
                      const periodLabel =
                        "label" in item ? item.label : item.month;
                      return (
                        <Box
                          key={`${periodLabel}-${index}`}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,
                          }}
                        >
                          <Typography sx={{ color: "#64748b" }}>
                            {periodLabel}
                          </Typography>
                          <Typography sx={{ fontWeight: 700 }}>
                            {formatCurrency(item.value)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>
                    En Çok Kullanılan Rotalar
                  </Typography>
                  <Box sx={{ display: "grid", gap: 1 }}>
                    {(routeReport.length
                      ? routeReport
                      : (overview?.popularRoutes ?? []).map((route) => ({
                          route: route.label,
                          bookings: route.value,
                          revenue: 0,
                          passengers: 0,
                        }))
                    ).map((item) => (
                      <Box
                        key={item.route}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Typography sx={{ color: "#64748b" }}>
                          {item.route}
                        </Typography>
                        <Typography sx={{ fontWeight: 700 }}>
                          {item.bookings} rezervasyon
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>

              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                }}
              >
                <Typography sx={{ fontWeight: 700, mb: 2 }}>
                  Şirket Performansı
                </Typography>
                {companyReport.length === 0 ? (
                  <Typography sx={{ color: "#64748b" }}>
                    Şirket raporu bulunamadı.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Şirket</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Sefer</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            Rezervasyon
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Yolcu</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Araç</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Gelir</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {companyReport.map((item) => (
                          <TableRow key={item.companyId}>
                            <TableCell>
                              <Typography sx={{ fontWeight: 700 }}>
                                {item.name}
                              </Typography>
                              <Typography
                                sx={{ fontSize: "0.78rem", color: "#64748b" }}
                              >
                                {item.routes.length} rota
                              </Typography>
                            </TableCell>
                            <TableCell>{item.trips}</TableCell>
                            <TableCell>{item.bookings}</TableCell>
                            <TableCell>{item.passengers}</TableCell>
                            <TableCell>{item.vehicleCount}</TableCell>
                            <TableCell>
                              {formatCurrency(item.revenue)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {companyReport.length > 0 && (
                  <Box sx={{ mt: 3, display: "grid", gap: 2 }}>
                    {companyReport.map((item) => (
                      <Paper
                        key={`${item.companyId}-routes`}
                        elevation={0}
                        sx={{
                          p: 2.25,
                          borderRadius: 2,
                          border: "1px solid #eef2f7",
                          boxShadow: "none",
                        }}
                      >
                        <Typography sx={{ fontWeight: 700, mb: 1 }}>
                          {item.name} rota detayları
                        </Typography>
                        {item.routes.length === 0 ? (
                          <Typography
                            sx={{ fontSize: "0.84rem", color: "#64748b" }}
                          >
                            Bu firmaya ait kayıtlı rota bulunamadı.
                          </Typography>
                        ) : (
                          <Box sx={{ display: "grid", gap: 1 }}>
                            {item.routes.map((route) => (
                              <Box
                                key={`${item.companyId}-${route.route}-${route.price}`}
                                sx={{
                                  display: "grid",
                                  gap: 0.3,
                                  gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "2fr 1fr 1fr 1fr",
                                  },
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: "0.86rem",
                                    color: "#0f172a",
                                    fontWeight: 600,
                                  }}
                                >
                                  {route.route}
                                </Typography>
                                <Typography
                                  sx={{ fontSize: "0.84rem", color: "#64748b" }}
                                >
                                  Fiyat: {formatCurrency(route.price)}
                                </Typography>
                                <Typography
                                  sx={{ fontSize: "0.84rem", color: "#64748b" }}
                                >
                                  Yolcu: {route.passengers}
                                </Typography>
                                <Typography
                                  sx={{ fontSize: "0.84rem", color: "#64748b" }}
                                >
                                  Araç: {route.vehicle}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            </Box>
          )}

          {activeSection === "settings" && (
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
              >
                Ayarlar
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>
                Yetki, şirket ve oturum özetleri.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                  mb: 4,
                }}
              >
                {[
                  { label: "Rol", value: role },
                  { label: "Oturum", value: token ? "Aktif" : "Pasif" },
                  { label: "Şirket", value: companies.length },
                ].map((card) => (
                  <Paper
                    key={card.label}
                    elevation={0}
                    sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#64748b",
                        mb: 1,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "1.6rem",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Paper
                elevation={0}
                sx={{ p: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}
              >
                <Typography sx={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Firma, sefer, rota ve araç yönetimi rolünüze göre ilgili
                  sekmelerden yapılır.
                </Typography>
              </Paper>
            </Box>
          )}

          {activeSection === "companies" && (
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
              >
                Firmalar
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>
                Firma ekleme, listeleme ve silme işlemleri.
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  mb: 3,
                }}
              >
                <Typography sx={{ fontWeight: 700, mb: 2 }}>
                  Yeni Firma Ekle
                </Typography>
                <Box
                  component="form"
                  onSubmit={onCreateCompany}
                  sx={{ display: "grid", gap: 2 }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="Firma Adı"
                      value={newCompanyValues.companyName}
                      onChange={(event) =>
                        setNewCompanyValues((prev) => ({
                          ...prev,
                          companyName: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="Yetkili"
                      value={newCompanyValues.contactName}
                      onChange={(event) =>
                        setNewCompanyValues((prev) => ({
                          ...prev,
                          contactName: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <TextField
                      label="E-posta"
                      type="email"
                      value={newCompanyValues.email}
                      onChange={(event) =>
                        setNewCompanyValues((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      label="Şifre (opsiyonel)"
                      type="password"
                      value={newCompanyValues.password}
                      onChange={(event) =>
                        setNewCompanyValues((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      fullWidth
                    />
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        bgcolor: "#002D62",
                        "&:hover": { bgcolor: "#001f44" },
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Firma Ekle
                    </Button>
                  </Box>
                  {companyStatus && (
                    <Typography
                      sx={{
                        color:
                          companyStatus.includes("başarı") ||
                          companyStatus.includes("silindi")
                            ? "#059669"
                            : "#dc2626",
                        fontSize: "0.9rem",
                      }}
                    >
                      {companyStatus}
                    </Typography>
                  )}
                </Box>
              </Paper>

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Firma</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Yetkili</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>E-posta</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Durum</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        İşlem
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {company.companyName}
                        </TableCell>
                        <TableCell>{company.contactName}</TableCell>
                        <TableCell>{company.email}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: "0.84rem",
                              fontWeight: 700,
                              color:
                                company.status === "approved"
                                  ? "#16a34a"
                                  : "#d97706",
                            }}
                          >
                            {company.status}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => void onDeleteCompany(company.id)}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                          >
                            Sil
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {companies.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{ py: 4, color: "#94a3b8" }}
                        >
                          Kayıtlı firma bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeSection === "vehicles" && (
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
              >
                Araç Yönetimi
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>
                Araç ekleyin, görüntüleyin ve kaldırın.
              </Typography>

              {role === "company-admin" ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    mb: 3,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>
                    Yeni Araç Ekle
                  </Typography>
                  <Box
                    component="form"
                    onSubmit={onCreateVehicle}
                    sx={{ display: "grid", gap: 2 }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Plaka"
                        value={newVehicleValues.plate}
                        onChange={(event) =>
                          setNewVehicleValues((prev) => ({
                            ...prev,
                            plate: event.target.value,
                          }))
                        }
                        fullWidth
                      />
                      <TextField
                        label="Araç Tipi"
                        value={newVehicleValues.busType}
                        onChange={(event) =>
                          setNewVehicleValues((prev) => ({
                            ...prev,
                            busType: event.target.value,
                          }))
                        }
                        fullWidth
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Koltuk Sayısı"
                        type="number"
                        value={newVehicleValues.seatsTotal}
                        onChange={(event) =>
                          setNewVehicleValues((prev) => ({
                            ...prev,
                            seatsTotal: event.target.value,
                          }))
                        }
                        fullWidth
                      />
                      <TextField
                        label="Dizilim"
                        select
                        value={newVehicleValues.seatLayout}
                        onChange={(event) =>
                          setNewVehicleValues((prev) => ({
                            ...prev,
                            seatLayout: event.target.value as
                              | "2+2"
                              | "2+1"
                              | "1+1",
                          }))
                        }
                        fullWidth
                      >
                        <MenuItem value="2+2">2+2</MenuItem>
                        <MenuItem value="2+1">2+1</MenuItem>
                        <MenuItem value="1+1">1+1</MenuItem>
                      </TextField>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          bgcolor: "#002D62",
                          "&:hover": { bgcolor: "#001f44" },
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Araç Ekle
                      </Button>
                    </Box>
                    {vehicleStatus && (
                      <Typography
                        sx={{
                          color:
                            vehicleStatus.includes("başarı") ||
                            vehicleStatus.includes("silindi")
                              ? "#059669"
                              : "#dc2626",
                          fontSize: "0.9rem",
                        }}
                      >
                        {vehicleStatus}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ) : null}

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Plaka</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Tip</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Koltuk</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Dizilim</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        İşlem
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {vehicle.plate}
                        </TableCell>
                        <TableCell>{vehicle.busType}</TableCell>
                        <TableCell>{vehicle.seatsTotal}</TableCell>
                        <TableCell>{vehicle.seatLayout}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => void onDeleteVehicle(vehicle.id)}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                          >
                            Sil
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {vehicles.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{ py: 4, color: "#94a3b8" }}
                        >
                          Kayıtlı araç bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeSection === "route-management" && (
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
              >
                Rota Yönetimi
              </Typography>
              <Typography sx={{ color: "#64748b", fontSize: "0.9rem", mb: 4 }}>
                Güzergahları ekleyin, listeleyin ve kaldırın.
              </Typography>

              {role === "company-admin" ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: "1px solid #e2e8f0",
                    mb: 3,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, mb: 2 }}>
                    Yeni Rota Ekle
                  </Typography>
                  <Box
                    component="form"
                    onSubmit={onCreateRoute}
                    sx={{ display: "grid", gap: 2 }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Nereden"
                        value={newRouteValues.from}
                        onChange={(event) =>
                          setNewRouteValues((prev) => ({
                            ...prev,
                            from: event.target.value,
                          }))
                        }
                        fullWidth
                      />
                      <TextField
                        label="Nereye"
                        value={newRouteValues.to}
                        onChange={(event) =>
                          setNewRouteValues((prev) => ({
                            ...prev,
                            to: event.target.value,
                          }))
                        }
                        fullWidth
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 2,
                      }}
                    >
                      <TextField
                        label="Temel Fiyat"
                        type="number"
                        value={newRouteValues.basePrice}
                        onChange={(event) =>
                          setNewRouteValues((prev) => ({
                            ...prev,
                            basePrice: event.target.value,
                          }))
                        }
                        fullWidth
                      />
                      <TextField
                        label="Süre (dk)"
                        type="number"
                        value={newRouteValues.durationMinutes}
                        onChange={(event) =>
                          setNewRouteValues((prev) => ({
                            ...prev,
                            durationMinutes: event.target.value,
                          }))
                        }
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          bgcolor: "#002D62",
                          "&:hover": { bgcolor: "#001f44" },
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        Rota Ekle
                      </Button>
                    </Box>
                    {routeStatus && (
                      <Typography
                        sx={{
                          color:
                            routeStatus.includes("başarı") ||
                            routeStatus.includes("silindi")
                              ? "#059669"
                              : "#dc2626",
                          fontSize: "0.9rem",
                        }}
                      >
                        {routeStatus}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ) : null}

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Nereden</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nereye</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Temel Fiyat
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Süre</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        İşlem
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routes.map((route, idx) => (
                      <TableRow key={`${route.from}-${route.to}-${idx}`} hover>
                        <TableCell>{route.from}</TableCell>
                        <TableCell>{route.to}</TableCell>
                        <TableCell>₺{route.basePrice}</TableCell>
                        <TableCell>{route.durationMinutes} dk</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => void onDeleteRoute(idx)}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                          >
                            Sil
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {routes.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          align="center"
                          sx={{ py: 4, color: "#94a3b8" }}
                        >
                          Kayıtlı rota bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
