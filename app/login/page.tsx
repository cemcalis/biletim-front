"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import UserNavbar from "../../components/user-navbar";
import { setStoredUser } from "../../lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      return;
    }
    setStoredUser(name, email);
    router.push("/my-bookings");
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#12203a]">
      <UserNavbar active="home" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        <section className="rounded-xl border border-[#dce3f1] bg-white p-6">
          <h1 className="text-3xl font-semibold">Giriş</h1>
          <p className="mt-2 text-sm text-[#5b6b87]">Rezervasyonlarınızı görüntülemek için bilgilerinizi girin.</p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Örn: Cem Çalış" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-[#d8deec] px-3 py-2" placeholder="Örn: cem@example.com" type="email" />
            <button className="rounded-md bg-[#2a64e8] px-4 py-2 text-sm font-medium text-white">Devam Et</button>
          </form>
        </section>
      </main>
    </div>
  );
}
