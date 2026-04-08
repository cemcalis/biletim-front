"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { apiGet, apiRequest } from "../../lib/api";

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
};

type CompanyTrip = {
  id: string;
  from: string;
  to: string;
  departureTime: string;
  durationMinutes: number;
  price: number;
  busType: string;
  seatsTotal: number;
};

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
  const [vehicleSeats, setVehicleSeats] = useState("40");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("360");
  const [price, setPrice] = useState("900");
  const [tripType, setTripType] = useState("");
  const [tripSeats, setTripSeats] = useState("40");

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
      setVehicles(vehicleResult.ok ? vehicleResult.vehicles : []);
      setTrips(tripResult.ok ? tripResult.trips : []);
    }

    void loadData();
  }, [token]);

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
      seatsTotal: Number(vehicleSeats),
    });
    if (!result.ok) {
      setInfo(result.message ?? "Arac eklenemedi.");
      return;
    }
    setInfo("Arac eklendi.");
    setPlate("");
    setVehicleType("");
    const vehicleResult = await apiGet<{ ok: boolean; vehicles: CompanyVehicle[] }>(`/company/vehicles?token=${encodeURIComponent(token)}`);
    setVehicles(vehicleResult.ok ? vehicleResult.vehicles : []);
  }

  async function onAddTrip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await apiRequest<{ ok: boolean; message?: string }>("/company/trips", "POST", {
      token,
      from,
      to,
      departureTime,
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      busType: tripType,
      seatsTotal: Number(tripSeats),
    });
    if (!result.ok) {
      setInfo(result.message ?? "Sefer eklenemedi.");
      return;
    }
    setInfo("Sefer eklendi.");
    setFrom("");
    setTo("");
    setDepartureTime("");
    setTripType("");
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
      <div className="min-h-screen bg-[#f4f6fa] px-4 py-10 text-[#12203a] sm:px-8">
        <main className="mx-auto max-w-lg rounded-xl border border-[#dce3f1] bg-white p-6">
          <h1 className="text-3xl font-semibold">Firma Paneli Giris</h1>
          <p className="mt-2 text-sm text-[#5b6b87]">Firma paneline erismek icin onayli hesabinizla giris yapin.</p>
          <form onSubmit={onLogin} className="mt-5 space-y-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Firma e-posta" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Sifre" type="password" />
            <button className="rounded-md bg-[#2a64e8] px-4 py-2 text-sm font-medium text-white">Giris Yap</button>
          </form>
          {loginError ? <p className="mt-3 text-sm text-[#d34255]">{loginError}</p> : null}
          <p className="mt-4 text-sm text-[#5b6b87]">
            Hesabiniz yok mu?
            <Link href="/company/register" className="ml-1 font-medium text-[#2a64e8] hover:underline">
              Firma Kayit Basvurusu
            </Link>
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] px-4 py-8 text-[#12203a] sm:px-8">
      <main className="mx-auto max-w-6xl space-y-4">
        <section className="rounded-xl border border-[#dce3f1] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold">Firma Paneli</h1>
              <p className="text-sm text-[#5b6b87]">Otobus, arac ve sefer yonetimi</p>
            </div>
            <button onClick={onLogout} className="rounded-md border border-[#f0c5cc] px-3 py-2 text-sm text-[#d34255]">Cikis Yap</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-[#eef3ff] p-3 text-sm">Arac: {overview?.metrics?.vehicles ?? 0}</div>
            <div className="rounded-lg bg-[#eef3ff] p-3 text-sm">Sefer: {overview?.metrics?.trips ?? 0}</div>
            <div className="rounded-lg bg-[#eef3ff] p-3 text-sm">Rezervasyon: {overview?.metrics?.bookings ?? 0}</div>
            <div className="rounded-lg bg-[#eef3ff] p-3 text-sm">Gelir: ₺{overview?.metrics?.revenue ?? 0}</div>
          </div>
          {info ? <p className="mt-3 text-sm text-[#2a64e8]">{info}</p> : null}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-[#dce3f1] bg-white p-5">
            <h2 className="text-xl font-semibold">Arac Ekle</h2>
            <form onSubmit={onAddVehicle} className="mt-3 space-y-2">
              <input value={plate} onChange={(e) => setPlate(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Plaka" />
              <input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Arac tipi" />
              <input value={vehicleSeats} onChange={(e) => setVehicleSeats(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Koltuk sayisi" />
              <button className="rounded-md bg-[#2a64e8] px-3 py-2 text-sm text-white">Arac Kaydet</button>
            </form>
            <ul className="mt-4 space-y-2 text-sm text-[#334560]">
              {vehicles.map((vehicle) => (
                <li key={vehicle.id} className="rounded-md bg-[#f6f8fc] p-2">{vehicle.plate} - {vehicle.busType} ({vehicle.seatsTotal})</li>
              ))}
            </ul>
          </article>

          <article className="rounded-xl border border-[#dce3f1] bg-white p-5">
            <h2 className="text-xl font-semibold">Sefer Ekle</h2>
            <form onSubmit={onAddTrip} className="mt-3 space-y-2">
              <input value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Nereden" />
              <input value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Nereye" />
              <input value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Kalkis saati" />
              <div className="grid grid-cols-2 gap-2">
                <input value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Sure dakika" />
                <input value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Fiyat" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input value={tripType} onChange={(e) => setTripType(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Otobus tipi" />
                <input value={tripSeats} onChange={(e) => setTripSeats(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Koltuk" />
              </div>
              <button className="rounded-md bg-[#2a64e8] px-3 py-2 text-sm text-white">Sefer Kaydet</button>
            </form>
            <ul className="mt-4 space-y-2 text-sm text-[#334560]">
              {trips.map((trip) => (
                <li key={trip.id} className="rounded-md bg-[#f6f8fc] p-2">{trip.from} - {trip.to} / {trip.departureTime} / ₺{trip.price}</li>
              ))}
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}
