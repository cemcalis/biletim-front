"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import UserNavbar from "../../components/user-navbar";
import { apiGet, apiRequest } from "../../lib/api";
import { getStoredUser } from "../../lib/session";

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

type ActiveTab = "bookings" | "payments" | "profile";

function statusClasses(status: Booking["status"]) {
  if (status === "Confirmed") return "bg-emerald-100 text-emerald-700";
  if (status === "Completed") return "bg-sky-100 text-sky-700";
  return "bg-rose-100 text-rose-700";
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
    <div className="min-h-screen bg-[#f4f6fa] text-[#12203a]">
      <UserNavbar active="bookings" />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#e5eaf6] text-sm font-semibold">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Hoş geldiniz, {name}!</h1>
              <p className="text-[#5b6b87]">Rezervasyonlarınızı ve profilinizi yönetin</p>
            </div>
          </div>
          <Link href="/" className="rounded-md border border-[#d8dfed] bg-white px-4 py-2 text-sm">
            Ana Sayfaya Dön
          </Link>
        </section>

        <section className="mt-5 inline-flex rounded-xl bg-[#e8ebf2] p-1 text-sm">
          <button onClick={() => setTab("bookings")} className={`rounded-lg px-8 py-2 ${tab === "bookings" ? "bg-white font-medium" : "text-[#5a647d]"}`}>Rezervasyonlarım</button>
          <button onClick={() => setTab("payments")} className={`rounded-lg px-8 py-2 ${tab === "payments" ? "bg-white font-medium" : "text-[#5a647d]"}`}>Ödemeler</button>
          <button onClick={() => setTab("profile")} className={`rounded-lg px-8 py-2 ${tab === "profile" ? "bg-white font-medium" : "text-[#5a647d]"}`}>Profil</button>
        </section>

        {message ? <p className="mt-4 rounded-md bg-[#ecf2ff] px-3 py-2 text-sm text-[#285fdf]">{message}</p> : null}

        {tab === "profile" ? (
          <section className="mt-5 rounded-xl border border-[#dde4f1] bg-white p-4">
            <p className="text-sm text-[#5f6d88]">Ad Soyad</p>
            <p className="text-lg font-medium">{name}</p>
            <p className="mt-3 text-sm text-[#5f6d88]">E-posta</p>
            <p className="text-lg font-medium">{email}</p>
          </section>
        ) : null}

        {tab === "payments" ? (
          <section className="mt-5 rounded-xl border border-[#dde4f1] bg-white p-4 text-sm text-[#5f6d88]">
            Tüm ödemeler rezervasyon kayıtlarından otomatik oluşur. İşlem geçmişi için rezervasyon listenizi inceleyin.
          </section>
        ) : null}

        {tab === "bookings" ? (
          <section className="mt-5 space-y-3">
            {loading ? <p className="rounded-xl border border-[#dde4f1] bg-white p-4">Rezervasyonlar yükleniyor...</p> : null}
            {!loading && !bookings.length ? (
              <p className="rounded-xl border border-[#dde4f1] bg-white p-4">Bu hesapta rezervasyon bulunamadı.</p>
            ) : null}

            {bookings.map((booking) => (
              <article key={booking.bookingCode} className="rounded-xl border border-[#dde4f1] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClasses(booking.status)}`}>
                      {booking.status}
                    </p>
                    <p className="text-xs text-[#66758f]">#{booking.bookingCode}</p>
                    <p className="text-2xl font-semibold">{booking.company}</p>
                    <p className="text-sm text-[#5f6d88]">{booking.route}</p>
                    <p className="text-sm text-[#5f6d88]">{booking.travelDate}</p>
                    <p className="text-sm text-[#5f6d88]">{booking.departureTime} - {booking.arrivalTime}</p>
                  </div>

                  <div className="space-y-1 text-sm text-[#5f6d88]">
                    <p>Koltuk: {booking.seatNumber}</p>
                    <p>Yolcu: {booking.passengers}</p>
                    <p className="text-2xl font-semibold text-[#245fe6]">Rs {booking.totalPrice}</p>
                  </div>

                  <div className="space-y-2">
                    <button onClick={() => void onDownload(booking.bookingCode)} className="w-full rounded-md bg-[#101a33] px-4 py-2 text-sm font-medium text-white">
                      İndir
                    </button>
                    <button
                      onClick={() => void onCancel(booking.bookingCode)}
                      disabled={booking.status === "Canceled"}
                      className="w-full rounded-md border border-[#f0c5cc] px-4 py-2 text-sm text-[#d34255] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </main>
    </div>
  );
}
