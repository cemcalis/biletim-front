"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import UserNavbar from "../../components/user-navbar";
import { apiGet, apiRequest } from "../../lib/api";
import { getStoredUser, setStoredUser } from "../../lib/session";

type Trip = {
  id: string;
  company: string;
  from: string;
  to: string;
  departureTime: string;
  durationMinutes: number;
  price: number;
  busType: string;
  rating: number;
  seatsTotal: number;
  seatsAvailable: number;
};

type Seat = {
  seatNumber: string;
  status: "available" | "booked";
};

type BookingResponse = {
  ok: boolean;
  bookingCode?: string;
  message?: string;
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export default function SearchBusesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f6fa] text-[#111d33]">
          <UserNavbar active="search" />
          <main className="mx-auto max-w-6xl px-4 py-5 sm:px-8">
            <p className="rounded-xl border border-[#dfe5f1] bg-white p-4 text-sm">Sayfa hazırlanıyor...</p>
          </main>
        </div>
      }
    >
      <SearchBusesContent />
    </Suspense>
  );
}

function SearchBusesContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "İstanbul";
  const to = searchParams.get("to") ?? "Ankara";
  const date = searchParams.get("date") ?? "Bugün";

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [bookingInfo, setBookingInfo] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    const userName = user.name.trim();
    const userEmail = user.email.trim();
    setName(userName);
    setEmail(userEmail);
    setIsAuthenticated(Boolean(userName && userEmail));
  }, []);

  useEffect(() => {
    async function loadTrips() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ from, to });
        const data = await apiGet<Trip[]>(`/trips?${params.toString()}`);
        setTrips(data);
      } catch {
        setError("Sefer listesi yüklenemedi.");
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, [from, to]);

  async function onSelectTrip(trip: Trip) {
    setSelectedTrip(trip);
    setSelectedSeat("");
    setBookingInfo("");
    const seatResponse = await apiGet<{ found: boolean; seats: Seat[] }>(`/trips/${trip.id}/seats`);
    setSeats(seatResponse.found ? seatResponse.seats : []);
  }

  async function onBookSeat() {
    if (!isAuthenticated) {
      setBookingInfo("Bilet satın almak için önce hesabınıza giriş yapın.");
      return;
    }

    if (!selectedTrip || !selectedSeat || !name.trim() || !email.trim()) {
      setBookingInfo("Yolcu bilgisi, sefer ve koltuk seçimi zorunludur.");
      return;
    }

    try {
      const result = await apiRequest<BookingResponse>("/bookings", "POST", {
        tripId: selectedTrip.id,
        passengerName: name,
        passengerEmail: email,
        seatNumber: selectedSeat,
        travelDate: date,
      });
      if (result.ok) {
        setStoredUser(name, email);
        setIsAuthenticated(true);
        setBookingInfo(`Rezervasyon oluşturuldu: ${result.bookingCode}`);
        await onSelectTrip(selectedTrip);
      } else {
        setBookingInfo(result.message ?? "Rezervasyon oluşturulamadı.");
      }
    } catch {
      setBookingInfo("Rezervasyon isteği başarısız oldu.");
    }
  }

  const visibleCount = useMemo(() => trips.length, [trips]);

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#111d33]">
      <UserNavbar active="search" />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-8">
        <section className="rounded-xl border border-[#dfe5f1] bg-white p-3 text-sm text-[#2c3b58] sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>{from} - {to} {date}</p>
            <span className="rounded-md bg-[#eef2fb] px-2 py-1 text-xs">{visibleCount} sefer bulundu</span>
          </div>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {loading ? <p className="rounded-xl border border-[#dfe5f1] bg-white p-4 text-sm">Seferler yükleniyor...</p> : null}
            {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</p> : null}
            {!loading && !trips.length ? (
              <p className="rounded-xl border border-[#dfe5f1] bg-white p-4 text-sm">Bu rota için sefer bulunamadı.</p>
            ) : null}

            {trips.map((trip) => (
              <article key={trip.id} className="rounded-xl border border-[#dfe5f1] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{trip.company}</p>
                    <p className="text-sm text-[#5f6d88]">{trip.busType}</p>
                    <p className="text-xs text-[#5f6d88]">{trip.rating} puan</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-semibold">{trip.departureTime}</p>
                    <p className="text-xs text-[#5f6d88]">{trip.from}</p>
                  </div>

                  <div className="text-center text-sm text-[#5f6d88]">
                    <p>{formatDuration(trip.durationMinutes)}</p>
                    <div className="mx-auto mt-1 h-px w-14 bg-[#d7ddea]" />
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-semibold">{trip.to}</p>
                    <p className="text-xs text-[#5f6d88]">{trip.seatsAvailable} koltuk boş</p>
                  </div>

                  <div className="ml-auto text-right">
                    <p className="text-3xl font-semibold text-[#2b65e7]">₺ {trip.price}</p>
                    <button
                      onClick={() => void onSelectTrip(trip)}
                      className="mt-2 rounded-md bg-[#2a64e8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f53c8]"
                    >
                      Koltuk Seç
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-xl border border-[#dfe5f1] bg-white p-4">
            <h2 className="text-lg font-semibold">Koltuk Seçimi</h2>
            <p className="mt-1 text-sm text-[#5f6d88]">
              {selectedTrip ? `${selectedTrip.company} (${selectedTrip.id})` : "Lütfen bir sefer seçin"}
            </p>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {seats.map((seat) => (
                <button
                  key={seat.seatNumber}
                  disabled={seat.status === "booked"}
                  onClick={() => setSelectedSeat(seat.seatNumber)}
                  className={`rounded-md px-2 py-2 text-xs font-medium ${
                    seat.status === "booked"
                      ? "cursor-not-allowed bg-[#eceff6] text-[#95a1ba]"
                      : selectedSeat === seat.seatNumber
                        ? "bg-[#2a64e8] text-white"
                        : "bg-[#f3f6fc] text-[#24324e]"
                  }`}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Cem Çalış"
                disabled={!isAuthenticated}
                className="w-full rounded-md border border-[#d8deec] px-3 py-2 text-sm"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Örn: cem@example.com"
                disabled={!isAuthenticated}
                className="w-full rounded-md border border-[#d8deec] px-3 py-2 text-sm"
              />
              {!isAuthenticated ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Rezervasyon için oturum açmanız gerekiyor.
                  <Link href="/login" className="ml-1 font-medium underline">Giriş yap</Link>
                </div>
              ) : null}
              <button
                onClick={() => void onBookSeat()}
                disabled={!isAuthenticated}
                className="w-full rounded-md bg-[#101a33] px-3 py-2 text-sm font-medium text-white"
              >
                Rezervasyonu Onayla
              </button>
              {bookingInfo ? <p className="text-sm text-[#2a64e8]">{bookingInfo}</p> : null}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
