"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import UserNavbar from "../components/user-navbar";
import { apiGet } from "../lib/api";

type RouteSummary = {
  from: string;
  to: string;
  basePrice: number;
  durationMinutes: number;
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export default function HomePage() {
  const router = useRouter();
  const [from, setFrom] = useState("İstanbul");
  const [to, setTo] = useState("Ankara");
  const [date, setDate] = useState("Bugün");
  const [routeCards, setRouteCards] = useState<RouteSummary[]>([]);

  useEffect(() => {
    apiGet<RouteSummary[]>("/routes")
      .then((data) => setRouteCards(data))
      .catch(() => setRouteCards([]));
  }, []);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ from, to, date });
    router.push(`/search-buses?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#121f36]">
      <UserNavbar active="home" />

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-8">
        <section className="text-center">
          <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
            Otobüs biletinizi
            <span className="block text-[#2a64e8]">kolayca ayırtın</span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-[#4f5f7d] sm:text-xl">
            Gerçek zamanlı sefer takibi, güvenli ödeme ve anında rezervasyon onayı ile yolculuğunuzu
            zahmetsizce planlayın.
          </p>

          <form onSubmit={onSearch} className="mx-auto mt-8 max-w-4xl rounded-2xl border border-[#d9e0ee] bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-medium">Sizin için uygun seferi bulun</h2>
            <div className="mt-4 grid gap-3 text-left md:grid-cols-4">
              <label className="space-y-1 text-xs text-[#55627f]">
                <span>Nereden</span>
                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-md border border-[#d8dfed] px-3 py-2 text-sm text-[#1a2740]"
                  placeholder="Kalkış şehri"
                />
              </label>
              <label className="space-y-1 text-xs text-[#55627f]">
                <span>Nereye</span>
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-md border border-[#d8dfed] px-3 py-2 text-sm text-[#1a2740]"
                  placeholder="Varış şehri"
                />
              </label>
              <label className="space-y-1 text-xs text-[#55627f]">
                <span>Yolculuk tarihi</span>
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border border-[#d8dfed] px-3 py-2 text-sm text-[#1a2740]"
                  placeholder="Tarih seçin"
                />
              </label>
              <button
                type="submit"
                className="mt-auto rounded-md bg-[#2a64e8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f53c8]"
              >
                Otobüs Ara
              </button>
            </div>
          </form>
        </section>
      </main>

      <section className="bg-[]">
        <div className=" grid max-w-6xl grid-cols-2 gap-6 px-4 py-9 text-white sm:grid-cols-4 sm:px-8">
          <div>
            <p className="text-4xl font-semibold">500.000+</p>
            <p className="text-sm text-white/90">Memnun yolcu</p>
          </div>
          <div>
            <p className="text-4xl font-semibold">2000+</p>
            <p className="text-sm text-white/90">Aktif hat</p>
          </div>
          <div>
            <p className="text-4xl font-semibold">500+</p>
            <p className="text-sm text-white/90">Şöför</p>
          </div>
          <div>
            <p className="text-4xl font-semibold">1500+</p>
            <p className="text-sm text-white/90">Aktif sefer</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
        <div className="text-center">
          <h3 className="text-2xl font-semibold">Neden Near East Ulaşım?</h3>
          <p className="mt-2 text-[#566583]">Daha sade, güvenilir ve kurumsal bir rezervasyon deneyimi sunar</p>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Güvenli Ödeme", "Kart, dijital cüzdan ve havale seçenekleriyle güvenli işlem"],
            ["Canlı Takip", "Seferinizi anlık izleyin ve durum güncellemelerini takip edin"],
            ["Kolay Rezervasyon", "Birkaç adımda hızlıca bilet ayırtın"],
            ["7/24 Destek", "İhtiyacınız olduğunda ulaşabileceğiniz destek kanalı"],
          ].map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-[#d8deec] bg-white p-5 text-center">
              <h4 className="text-xl font-medium">{title}</h4>
              <p className="mt-3 text-sm text-[#5d6c87]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-8">
        <div className="text-center">
          <h3 className="text-3xl font-semibold">Popüler Hatlar</h3>
          <p className="mt-2 text-[#566583]">Sık tercih edilen rotalara göz atın</p>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {routeCards.map((item) => (
            <article key={`${item.from}-${item.to}`} className="rounded-2xl border border-[#d8deec] bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{item.from}</p>
                  <p className="text-sm text-[#5c6883]">ile {item.to}</p>
                </div>
                <span className="rounded-md bg-[#eef2fa] px-2 py-0.5 text-xs">₺ {item.basePrice}</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-[#5c6883]">
                <span>{formatDuration(item.durationMinutes)}</span>
                <span>4,5</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
