"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiRequest } from "../../../lib/api";

export default function CompanyRegisterPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await apiRequest<{ ok: boolean; message?: string }>("/company/register", "POST", {
      companyName,
      contactName,
      email,
      password,
    });
    setMessage(result.message ?? (result.ok ? "Basvuru gonderildi." : "Basvuru basarisiz."));
    if (result.ok) {
      setCompanyName("");
      setContactName("");
      setEmail("");
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] px-4 py-10 text-[#12203a] sm:px-8">
      <main className="mx-auto max-w-xl rounded-xl border border-[#dce3f1] bg-white p-6">
        <h1 className="text-3xl font-semibold">Firma Kayit Basvurusu</h1>
        <p className="mt-2 text-sm text-[#5b6b87]">Admin onayi sonrasi firma paneline giris yapabilirsiniz.</p>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Firma adi" />
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Yetkili adi" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Firma e-posta" type="email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Sifre" type="password" />
          <button className="rounded-md bg-[#2a64e8] px-4 py-2 text-sm font-medium text-white">Basvuru Gonder</button>
        </form>
        {message ? <p className="mt-3 text-sm text-[#2a64e8]">{message}</p> : null}
        <p className="mt-4 text-sm text-[#5b6b87]">
          Firma paneline donmek icin
          <Link href="/company" className="ml-1 font-medium text-[#2a64e8] hover:underline">Giris sayfasi</Link>
        </p>
      </main>
    </div>
  );
}
