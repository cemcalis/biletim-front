"use client";

import Link from "next/link";
import UserNavbar from "../../components/user-navbar";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#12203a]">
      <UserNavbar active="home" />
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
        <section className="rounded-xl border border-[#dce3f1] bg-white p-6">
          <h1 className="text-3xl font-semibold">Kayit Ekrani Degisti</h1>
          <p className="mt-2 text-sm text-[#5b6b87]">
            Kayit sadece firma panelinde yapilir ve admin onayi gerektirir.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/company/register" className="rounded-md bg-[#2a64e8] px-4 py-2 text-sm font-medium text-white">
              Firma Kayit Basvurusu
            </Link>
            <Link href="/login" className="rounded-md border border-[#d8deec] px-4 py-2 text-sm font-medium text-[#24324f]">
              Kullanici Girisi
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
