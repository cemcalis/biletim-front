"use client";

import { FormEvent, useState } from "react";
import UserNavbar from "../../components/user-navbar";
import { apiGet } from "../../lib/api";

type Booking = {
  bookingCode: string;
  route: string;
  company: string;
  seatNumber: string;
  passengerName: string;
  status: "Confirmed" | "Completed" | "Canceled";
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
};

export default function TrackBusPage() {
  const [bookingCode, setBookingCode] = useState("");
  const [result, setResult] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  async function onTrack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const booking = await apiGet<Booking | null>(`/bookings/${bookingCode}`);
      if (!booking) {
        setResult(null);
        setError("Rezervasyon kodu bulunamadı.");
        return;
      }
      setResult(booking);
    } catch {
      setResult(null);
      setError("Takip isteği başarısız oldu.");
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#12203a]">
      <UserNavbar active="track" />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        <section className="rounded-xl border border-[#dce3f1] bg-white p-6">
          <h1 className="text-3xl font-semibold">Sefer Takibi</h1>
          <p className="mt-2 text-sm text-[#5b6b87]">Rezervasyon kodu ile sefer durumunu görüntüleyin.</p>

          <form onSubmit={onTrack} className="mt-5 flex gap-2">
            <input
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              className="flex-1 rounded-md border border-[#d8deec] px-3 py-2"
              placeholder="Örn: RB-123456"
            />
            <button className="rounded-md bg-[#2a64e8] px-4 py-2 text-sm font-medium text-white">Takip Et</button>
          </form>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          {result ? (
            <div className="mt-5 rounded-lg bg-[#f6f8fd] p-4 text-sm">
              <p><strong>Kod:</strong> {result.bookingCode}</p>
              <p><strong>Yolcu:</strong> {result.passengerName}</p>
              <p><strong>Rota:</strong> {result.route}</p>
              <p><strong>Firma:</strong> {result.company}</p>
              <p><strong>Koltuk:</strong> {result.seatNumber}</p>
              <p><strong>Durum:</strong> {result.status}</p>
              <p><strong>Tarih:</strong> {result.travelDate}</p>
              <p><strong>Saat:</strong> {result.departureTime} - {result.arrivalTime}</p>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
