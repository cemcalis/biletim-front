"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";
import { apiGet, apiRequest } from "@/lib/api";
import { CYPRUS_CITIES } from "@/lib/cities";

type AdminVehicle = {
  id: string;
  companyId: string;
  plate: string;
  busType: string;
  seatsTotal: number;
  seatLayout: string;
};

type AdminCompany = {
  id: string;
  companyName: string;
  status: string;
};

type VehiclesResponse = {
  ok: boolean;
  vehicles?: AdminVehicle[];
};

type CompaniesResponse = {
  ok: boolean;
  companies?: AdminCompany[];
};

type CreateTripResponse = {
  ok: boolean;
  message?: string;
};

export default function CreateTripPage() {
  const router = useRouter();
  const [token] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem("admin_token") ?? "";
  });
  const [role] = useState<"super-admin" | "company-admin">(() => {
    if (typeof window === "undefined") {
      return "super-admin";
    }
    const storedRole = localStorage.getItem("admin_role") as
      | "super-admin"
      | "company-admin"
      | null;
    return storedRole ?? "super-admin";
  });

  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
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

  const loadData = useCallback(async () => {
    try {
      const [vehiclesData, companiesData] = await Promise.all([
        apiGet<VehiclesResponse>(`/admin/vehicles?token=${encodeURIComponent(token)}`),
        apiGet<CompaniesResponse>(`/admin/companies?token=${encodeURIComponent(token)}`),
      ]);

      if (vehiclesData?.ok && vehiclesData.vehicles) {
        setVehicles(vehiclesData.vehicles);
      }
      if (companiesData?.ok && companiesData.companies) {
        setCompanies(companiesData.companies);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const timerId = window.setTimeout(() => {
        void loadData();
      }, 0);

      return () => {
        window.clearTimeout(timerId);
      };
    }
  }, [token, loadData]);

  useEffect(() => {
    if (!token) {
      router.replace("/admin");
    }
  }, [token, router]);

  const approvedCompanyOptions = useMemo(
    () => companies.filter((company) => company.status === "approved"),
    [companies],
  );

  const tripVehicleOptions = useMemo(() => {
    if (role === "company-admin") {
      const session = JSON.parse(localStorage.getItem("admin_session") || "{}");
      const scopedCompanyId = session?.companyId;
      if (!scopedCompanyId) {
        return [] as AdminVehicle[];
      }
      return vehicles.filter((vehicle) => vehicle.companyId === scopedCompanyId);
    }
    if (!newTripValues.companyId) {
      return [] as AdminVehicle[];
    }
    return vehicles.filter((vehicle) => vehicle.companyId === newTripValues.companyId);
  }, [role, vehicles, newTripValues.companyId]);

  async function onCreateTrip(event: React.FormEvent<HTMLFormElement>) {
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
      const result = await apiRequest<CreateTripResponse>("/admin/trips", "POST", {
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

      setTripStatus("Sefer başarıyla oluşturuldu. Yönlendiriliyor...");
      setTimeout(() => {
        router.push("/admin?section=trips");
      }, 1500);
    } catch {
      setTripStatus("Sefer oluşturulamadı. Lütfen tekrar deneyin.");
    }
  }

  if (!token) {
    return null;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f1f5f9", p: { xs: 3, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 800,
          mx: "auto",
          borderRadius: 2,
          border: "1px solid #e2e8f0",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", mb: 2 }}>
          Yeni Sefer Oluştur
        </Typography>
        <Typography sx={{ color: "#64748b", mb: 4, fontSize: "0.9rem" }}>
          Sefer bilgilerini doldurun ve onaya gönderin.
        </Typography>

        {tripStatus && (
          <Alert
            severity={tripStatus.includes("başarıyla") ? "success" : "error"}
            sx={{ mb: 3 }}
          >
            {tripStatus}
          </Alert>
        )}

        <Box component="form" onSubmit={onCreateTrip} sx={{ display: "grid", gap: 2 }}>
          {role === "super-admin" && (
            <TextField
              label="Firma"
              select
              value={newTripValues.companyId}
              onChange={(event) =>
                setNewTripValues((prev) => ({
                  ...prev,
                  companyId: event.target.value,
                  vehicleId: "",
                }))
              }
              fullWidth
            >
              <MenuItem value="">Firma seçin</MenuItem>
              {approvedCompanyOptions.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.companyName}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Araç"
            select
            value={newTripValues.vehicleId}
            onChange={(event) =>
              setNewTripValues((prev) => ({
                ...prev,
                vehicleId: event.target.value,
              }))
            }
            fullWidth
            disabled={role === "super-admin" && !newTripValues.companyId}
          >
            <MenuItem value="">Araç seçin</MenuItem>
            {tripVehicleOptions.map((vehicle) => (
              <MenuItem key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} - {vehicle.busType} - {vehicle.seatLayout}
              </MenuItem>
            ))}
          </TextField>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="Nereden"
              select
              value={newTripValues.from}
              onChange={(event) =>
                setNewTripValues((prev) => ({
                  ...prev,
                  from: event.target.value,
                }))
              }
              fullWidth
            >
              <MenuItem value="">Şehir seçin</MenuItem>
              {CYPRUS_CITIES.map((city) => (
                <MenuItem key={`trip-from-${city}`} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Nereye"
              select
              value={newTripValues.to}
              onChange={(event) =>
                setNewTripValues((prev) => ({
                  ...prev,
                  to: event.target.value,
                }))
              }
              fullWidth
            >
              <MenuItem value="">Şehir seçin</MenuItem>
              {CYPRUS_CITIES.map((city) => (
                <MenuItem key={`trip-to-${city}`} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="Tarih"
              type="date"
              value={newTripValues.departureDate}
              onChange={(event) =>
                setNewTripValues((prev) => ({
                  ...prev,
                  departureDate: event.target.value,
                }))
              }
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Saat"
              type="time"
              value={newTripValues.departureTime}
              onChange={(event) =>
                setNewTripValues((prev) => ({
                  ...prev,
                  departureTime: event.target.value,
                }))
              }
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>

          <TextField
            label="Fiyat"
            type="number"
            value={newTripValues.price}
            onChange={(event) =>
              setNewTripValues((prev) => ({
                ...prev,
                price: event.target.value,
              }))
            }
            fullWidth
          />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
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
              Sefer Oluştur
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => router.push("/admin?section=trips")}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              İptal
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
