"use client";

import { FormEvent, useEffect, useState } from "react";
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

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [requests, setRequests] = useState<CompanyRequest[]>([]);
  const [info, setInfo] = useState("");

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const stored = localStorage.getItem("admin_token") ?? "";
      setToken(stored);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!token) {
        return;
      }
      try {
        const overviewData = await apiGet<AdminOverviewResponse>("/admin/overview");
        setOverview(overviewData);
        const requestData = await apiGet<{ ok: boolean; message?: string; requests: CompanyRequest[] }>(`/admin/company-requests?token=${encodeURIComponent(token)}`);
        if (!requestData.ok) {
          setInfo(requestData.message ?? "Basvurular yuklenemedi.");
          return;
        }
        setRequests(requestData.requests);
      } catch {
        setInfo("Yonetim verileri yuklenemedi.");
      }
    }

    void loadData();
  }, [token]);

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    try {
      const result = await apiRequest<{ ok: boolean; token?: string; message?: string }>("/admin/login", "POST", {
        username,
        password,
      });
      if (!result.ok || !result.token) {
        setLoginError(result.message ?? "Giris basarisiz");
        return;
      }
      localStorage.setItem("admin_token", result.token);
      setToken(result.token);
      setPassword("");
    } catch {
      setLoginError("Giris istegi basarisiz.");
    }
  }

  async function onApprove(companyId: string) {
    const result = await apiRequest<{ ok: boolean; message?: string }>(`/admin/company-requests/${companyId}/approve`, "PATCH", {
      token,
    });
    if (!result.ok) {
      setInfo(result.message ?? "Onay islemi basarisiz.");
      return;
    }
    setInfo("Firma onaylandi.");
    setRequests((current) => current.filter((item) => item.id !== companyId));
  }

  function onLogout() {
    localStorage.removeItem("admin_token");
    setToken("");
    setOverview(null);
    setRequests([]);
    setInfo("");
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f4f6fa] px-4 py-10 text-[#12203a] sm:px-8">
        <main className="mx-auto max-w-md rounded-xl border border-[#dce3f1] bg-white p-6">
          <h1 className="text-3xl font-semibold">Admin Giris</h1>
          <p className="mt-2 text-sm text-[#5b6b87]">Yonetim paneline sadece URL ile erisilir.</p>
          <form onSubmit={onLogin} className="mt-5 space-y-3">
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Kullanici adi" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Sifre" type="password" />
            <button className="rounded-md bg-[#2a64e8] px-4 py-2 text-sm font-medium text-white">Giris Yap</button>
          </form>
          {loginError ? <p className="mt-3 text-sm text-[#d34255]">{loginError}</p> : null}
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
              <h1 className="text-3xl font-semibold">Admin Paneli</h1>
              <p className="text-sm text-[#5b6b87]">Firma onaylari ve genel metrikler</p>
            </div>
            <button onClick={onLogout} className="rounded-md border border-[#f0c5cc] px-3 py-2 text-sm text-[#d34255]">Cikis Yap</button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-[#eef3ff] p-3 text-sm">Rezervasyon: {overview?.metrics.totalBookings ?? 0}</div>
            <div className="rounded-lg bg-[#eef3ff] p-3 text-sm">Aktif Kullanici: {overview?.metrics.activeUsers ?? 0}</div>
            <div className="rounded-lg bg-[#eef3ff] p-3 text-sm">Hat: {overview?.metrics.busRoutes ?? 0}</div>
            <div className="rounded-lg bg-[#eef3ff] p-3 text-sm">Gelir: ₺{overview?.metrics.revenue ?? 0}</div>
          </div>
          {info ? <p className="mt-3 text-sm text-[#2a64e8]">{info}</p> : null}
        </section>

        <section className="rounded-xl border border-[#dce3f1] bg-white p-5">
          <h2 className="text-xl font-semibold">Bekleyen Firma Kayitlari</h2>
          {!requests.length ? <p className="mt-3 text-sm text-[#5b6b87]">Bekleyen basvuru yok.</p> : null}
          <div className="mt-3 space-y-2">
            {requests.map((request) => (
              <article key={request.id} className="rounded-md border border-[#e4e9f4] p-3">
                <p className="font-medium">{request.companyName}</p>
                <p className="text-sm text-[#5b6b87]">Yetkili: {request.contactName}</p>
                <p className="text-sm text-[#5b6b87]">E-posta: {request.email}</p>
                <button onClick={() => void onApprove(request.id)} className="mt-2 rounded-md bg-[#2a64e8] px-3 py-1.5 text-xs font-medium text-white">Onayla</button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
