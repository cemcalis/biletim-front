"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Box, Button, Container, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { CorporateBanner } from "@/components/corporate-banner";
import { CorporateFooter } from "@/components/corporate-footer";
import { CollapsibleSidebar } from "@/components/collapsible-sidebar";
import { apiGet, apiRequest } from "../../lib/api";
import styles from "./page.module.css";

type CompanyOverview = {
  ok: boolean;
  message?: string;
  company?: {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
  };
  metrics?: {
    vehicles: number;
    trips: number;
    bookings: number;
    revenue: number;
  };
};

type CompanyVehicle = {
  id: string;
  plate: string;
  busType: string;
  seatsTotal: number;
  seatLayout: "2+2" | "2+1" | "1+1";
  seatRows: number;
};

type CompanyTrip = {
  id: string;
  from: string;
  to: string;
  departureDate: string;
  arrivalDate: string;
  departureTime: string;
  durationMinutes: number;
  price: number;
  busType: string;
  seatsTotal: number;
  seatLayout: "2+2" | "2+1" | "1+1";
};

type SeatLayout = "2+2" | "2+1" | "1+1";

function getSeatLetters(layout: SeatLayout) {
  if (layout === "2+1") {
    return ["A", "B", "C"];
  }
  if (layout === "1+1") {
    return ["A", "B"];
  }
  return ["A", "B", "C", "D"];
}

function getAisleAfter(layout: SeatLayout) {
  if (layout === "1+1") {
    return 1;
  }
  return 2;
}

export default function CompanyPanelPage() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [vehicles, setVehicles] = useState<CompanyVehicle[]>([]);
  const [trips, setTrips] = useState<CompanyTrip[]>([]);
  const [info, setInfo] = useState("");

  const [plate, setPlate] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleSeatLayout, setVehicleSeatLayout] = useState<"2+2" | "2+1" | "1+1">("2+2");
  const [vehicleSeatRows, setVehicleSeatRows] = useState("10");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().slice(0, 10));
  const [arrivalDate, setArrivalDate] = useState(new Date().toISOString().slice(0, 10));
  const [departureTime, setDepartureTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("360");
  const [price, setPrice] = useState("900");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const previewSeatRows = useMemo(() => {
    const rows = Math.max(1, Number(vehicleSeatRows) || 1);
    const letters = getSeatLetters(vehicleSeatLayout);
    return Array.from({ length: rows }, (_, rowIndex) =>
      letters.map((letter) => `${letter}${rowIndex + 1}`),
    );
  }, [vehicleSeatLayout, vehicleSeatRows]);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const storedToken = localStorage.getItem("company_token") ?? "";
      setToken(storedToken);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!token) {
        return;
      }
      const overviewResult = await apiGet<CompanyOverview>(`/company/overview?token=${encodeURIComponent(token)}`);
      if (!overviewResult.ok) {
        setInfo(overviewResult.message ?? "Firma oturumu gecersiz.");
        return;
      }
      setOverview(overviewResult);

      const vehicleResult = await apiGet<{ ok: boolean; vehicles: CompanyVehicle[] }>(`/company/vehicles?token=${encodeURIComponent(token)}`);
      const tripResult = await apiGet<{ ok: boolean; trips: CompanyTrip[] }>(`/company/trips?token=${encodeURIComponent(token)}`);
      const loadedVehicles = vehicleResult.ok ? vehicleResult.vehicles : [];
      setVehicles(loadedVehicles);
      if (!selectedVehicleId && loadedVehicles.length) {
        setSelectedVehicleId(loadedVehicles[0].id);
      }
      setTrips(tripResult.ok ? tripResult.trips : []);
    }

    void loadData();
  }, [token, selectedVehicleId]);

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    try {
      const result = await apiRequest<{ ok: boolean; token?: string; message?: string }>("/company/login", "POST", {
        email,
        password,
      });
      if (!result.ok || !result.token) {
        setLoginError(result.message ?? "Giris basarisiz.");
        return;
      }
      localStorage.setItem("company_token", result.token);
      setToken(result.token);
      setEmail("");
      setPassword("");
    } catch {
      setLoginError("Giris istegi basarisiz.");
    }
  }

  async function onAddVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await apiRequest<{ ok: boolean; message?: string }>("/company/vehicles", "POST", {
      token,
      plate,
      busType: vehicleType,
      seatLayout: vehicleSeatLayout,
      seatRows: Number(vehicleSeatRows),
    });
    if (!result.ok) {
      setInfo(result.message ?? "Arac eklenemedi.");
      return;
    }
    setInfo("Arac eklendi.");
    setPlate("");
    setVehicleType("");
    setVehicleSeatRows("10");
    const vehicleResult = await apiGet<{ ok: boolean; vehicles: CompanyVehicle[] }>(`/company/vehicles?token=${encodeURIComponent(token)}`);
    const nextVehicles = vehicleResult.ok ? vehicleResult.vehicles : [];
    setVehicles(nextVehicles);
    if (!selectedVehicleId && nextVehicles.length) {
      setSelectedVehicleId(nextVehicles[0].id);
    }
  }

  async function onAddTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await apiRequest<{ ok: boolean; message?: string }>("/company/trips", "POST", {
      token,
      from,
      to,
      departureDate,
      arrivalDate,
      departureTime,
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      vehicleId: selectedVehicleId,
    });
    if (!result.ok) {
      setInfo(result.message ?? "Sefer eklenemedi.");
      return;
    }
    setInfo("Sefer eklendi.");
    setFrom("");
    setTo("");
    setDepartureTime("");
    const tripResult = await apiGet<{ ok: boolean; trips: CompanyTrip[] }>(`/company/trips?token=${encodeURIComponent(token)}`);
    setTrips(tripResult.ok ? tripResult.trips : []);
  }

  function onLogout() {
    localStorage.removeItem("company_token");
    setToken("");
    setOverview(null);
    setVehicles([]);
    setTrips([]);
    setInfo("");
  }

  if (!token) {
    return (
      <Box className={styles.pageRoot}>
        <CorporateBanner
          eyebrow="Firma paneli"
          title="Yönetim paneline giriş yapın"
          subtitle="Onaylı firma hesabınızla araç ve seferlerinizi yönetebilirsiniz."
        />
        <Container maxWidth="sm" className={styles.loginContainer}>
          <Paper elevation={0} className={styles.loginCard}>
            <Typography className={styles.loginTitle}>Firma Paneli Girişi</Typography>
            <Typography className={styles.loginSubtitle}>Firma paneline erişmek için onaylı hesabınızla giriş yapın.</Typography>
            <Box component="form" onSubmit={onLogin} className={styles.loginForm}>
              <TextField size="small" value={email} onChange={(event) => setEmail(event.target.value)} label="Firma e-posta" />
              <TextField size="small" value={password} onChange={(event) => setPassword(event.target.value)} label="Şifre" type="password" />
              <Button type="submit" variant="contained" disableElevation className={styles.primaryButton}>
                Giriş Yap
              </Button>
            </Box>
            {loginError ? <Typography className={styles.loginError}>{loginError}</Typography> : null}
            <Typography className={styles.registerText}>
              Hesabınız yok mu?
              <Box component={Link} href="/company/register" className={styles.registerLink}>
                Firma kayıt başvurusu
              </Box>
            </Typography>
          </Paper>
        </Container>
        <CorporateFooter />
      </Box>
    );
  }

  return (
    <Box className={styles.pageRoot}>
      <CorporateBanner
        eyebrow="Firma paneli"
        title="Araç, sefer ve operasyon yönetimi"
        subtitle="Tarih bazlı seferler oluşturun, araçlarınızı yönetin ve iş ortaklarınıza kurumsal bir operasyon deneyimi sunun."
      />

      <Container maxWidth="lg" className={styles.contentContainer}>
        <Box className={styles.workspaceLayout}>
          <Box className={styles.sidebarColumn}>
            <CollapsibleSidebar
              title="Firma Menü"
              subtitle="Hızlı erişim ve yönetim"
              items={[
                { label: "Genel Bakış", href: "#overview", key: "overview" },
                { label: "Araçlar", href: "#vehicles", key: "vehicles" },
                { label: "Seferler", href: "#trips", key: "trips" },
              ]}
              active="overview"
              onLogout={onLogout}
              secondaryButton={{
                label: "Firma başvurusu",
                href: "/company/register",
              }}
            />
          </Box>

          <Box className={styles.contentGrid}>
            <Paper id="overview" elevation={0} className={styles.panelCard}>
              <Box className={styles.panelHeader}>
                <Box>
                  <Typography className={styles.panelTitle}>Firma Paneli</Typography>
                  <Typography className={styles.panelSubtitle}>Otobüs, araç ve sefer yönetimi</Typography>
                </Box>
                <Button onClick={onLogout} variant="outlined" className={styles.logoutOutlineButton}>
                  Çıkış Yap
                </Button>
              </Box>
              <Box className={styles.metricGrid}>
                {[
                  { label: "Araç", value: overview?.metrics?.vehicles ?? 0 },
                  { label: "Sefer", value: overview?.metrics?.trips ?? 0 },
                  { label: "Rezervasyon", value: overview?.metrics?.bookings ?? 0 },
                  { label: "Gelir", value: `₺${overview?.metrics?.revenue ?? 0}` },
                ].map((item) => (
                  <Paper key={item.label} elevation={0} className={styles.metricCard}>
                    <Typography className={styles.metricLabel}>{item.label}</Typography>
                    <Typography className={styles.metricValue}>{item.value}</Typography>
                  </Paper>
                ))}
              </Box>
              {info ? <Typography className={styles.infoText}>{info}</Typography> : null}
            </Paper>

            <Box className={styles.twoColumnGrid}>
              <Paper id="vehicles" elevation={0} className={styles.panelCard}>
                <Typography className={styles.sectionTitle}>Araç Ekle</Typography>
                <Box component="form" onSubmit={onAddVehicle} className={styles.sectionForm}>
                  <TextField size="small" value={plate} onChange={(event) => setPlate(event.target.value)} label="Plaka" />
                  <TextField size="small" value={vehicleType} onChange={(event) => setVehicleType(event.target.value)} label="Araç tipi" />
                  <TextField select size="small" value={vehicleSeatLayout} onChange={(event) => setVehicleSeatLayout(event.target.value as "2+2" | "2+1" | "1+1")} label="Koltuk düzeni">
                    <MenuItem value="2+2">2+2</MenuItem>
                    <MenuItem value="2+1">2+1</MenuItem>
                    <MenuItem value="1+1">1+1</MenuItem>
                  </TextField>
                  <TextField size="small" value={vehicleSeatRows} onChange={(event) => setVehicleSeatRows(event.target.value)} label="Sıra sayısı" />
                  <Paper elevation={0} className={styles.mapCard}>
                    <Box className={styles.mapHeader}>
                      <Typography className={styles.mapTitle}>Koltuk Haritası Önizleme</Typography>
                      <Typography className={styles.mapMeta}>{vehicleSeatLayout} · {vehicleSeatRows} sıra</Typography>
                    </Box>

                    <Box className={styles.driverBar}>Şoför</Box>

                    <Box className={styles.mapRows}>
                      {previewSeatRows.map((row, rowIndex) => (
                        <Box key={`preview-row-${rowIndex + 1}`} className={styles.mapRow}>
                          {row.map((seatLabel, seatIndex) => (
                            <Box key={seatLabel} className={styles.mapSeatWrap}>
                              <Box className={styles.previewSeat}>{seatLabel}</Box>
                              {seatIndex + 1 === getAisleAfter(vehicleSeatLayout) ? <Box className={styles.aisle} /> : null}
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                  <Button type="submit" variant="contained" disableElevation className={styles.primaryButton}>
                    Araç Kaydet
                  </Button>
                </Box>
                <Box className={styles.listGrid}>
                  {vehicles.map((vehicle) => (
                    <Paper key={vehicle.id} elevation={0} className={styles.itemCard}>
                      <Typography className={styles.itemTitle}>{vehicle.plate}</Typography>
                      <Typography className={styles.itemMeta}>{vehicle.busType} · {vehicle.seatLayout} · {vehicle.seatRows} sıra · {vehicle.seatsTotal} koltuk</Typography>
                    </Paper>
                  ))}
                </Box>
              </Paper>

              <Paper id="trips" elevation={0} className={styles.panelCard}>
                <Typography className={styles.sectionTitle}>Sefer Ekle</Typography>
                <Box component="form" onSubmit={onAddTrip} className={styles.sectionForm}>
                  <TextField size="small" value={from} onChange={(event) => setFrom(event.target.value)} label="Nereden" />
                  <TextField size="small" value={to} onChange={(event) => setTo(event.target.value)} label="Nereye" />
                  <TextField select size="small" value={selectedVehicleId} onChange={(event) => setSelectedVehicleId(event.target.value)} label="Araç seçimi">
                    {vehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} · {vehicle.busType} · {vehicle.seatLayout}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Box className={styles.smallGridTwo}>
                    <TextField size="small" value={departureDate} onChange={(event) => setDepartureDate(event.target.value)} label="Kalkış tarihi" type="date" slotProps={{ inputLabel: { shrink: true } }} />
                    <TextField size="small" value={arrivalDate} onChange={(event) => setArrivalDate(event.target.value)} label="Varış tarihi" type="date" slotProps={{ inputLabel: { shrink: true } }} />
                  </Box>
                  <Box className={styles.smallGridTwo}>
                    <TextField size="small" value={departureTime} onChange={(event) => setDepartureTime(event.target.value)} label="Kalkış saati" placeholder="10:30" />
                    <TextField size="small" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} label="Süre dakika" />
                  </Box>
                  <Box className={styles.smallGridTwo}>
                    <TextField size="small" value={price} onChange={(event) => setPrice(event.target.value)} label="Fiyat" />
                    <TextField size="small" value={vehicles.find((item) => item.id === selectedVehicleId)?.seatsTotal ?? "-"} label="Koltuk" slotProps={{ input: { readOnly: true } }} />
                  </Box>
                  <TextField size="small" value={vehicles.find((item) => item.id === selectedVehicleId)?.busType ?? "-"} label="Otobüs tipi" slotProps={{ input: { readOnly: true } }} />
                  <Button type="submit" variant="contained" disableElevation className={styles.primaryButton}>
                    Sefer Kaydet
                  </Button>
                </Box>
                <Box className={styles.listGrid}>
                  {trips.map((trip) => (
                    <Paper key={trip.id} elevation={0} className={styles.itemCard}>
                      <Typography className={styles.itemTitle}>{trip.from} - {trip.to}</Typography>
                      <Typography className={styles.itemMeta}>
                        {trip.departureDate} · {trip.departureTime} · Varış {trip.arrivalDate}
                      </Typography>
                      <Typography className={styles.itemMeta}>{trip.busType} · {trip.seatLayout} · ₺{trip.price}</Typography>
                    </Paper>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Container>

      <CorporateFooter />
    </Box>
  );
}
