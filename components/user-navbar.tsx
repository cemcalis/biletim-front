"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearStoredUser, getStoredUser, setStoredUser } from "../lib/session";

type UserNavbarProps = {
  active: "home" | "search" | "track" | "bookings" | "admin";
};

function navClass(isActive: boolean) {
  return isActive
    ? "rounded-md bg-[#eaf0ff] px-3 py-1.5 text-[#2a63e8]"
    : "rounded-md px-3 py-1.5 text-[#2f3f5b] hover:bg-[#f1f4fa]";
}

export default function UserNavbar({ active }: UserNavbarProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [profileInfo, setProfileInfo] = useState("");

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      const user = getStoredUser();
      const nextName = user.name.trim();
      const nextEmail = user.email.trim();
      setName(nextName);
      setEmail(nextEmail);
      setDisplayName(nextName);
      setFormName(nextName);
      setFormEmail(nextEmail);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, []);
  function onSaveProfile() {
    const nextName = formName.trim();
    const nextEmail = formEmail.trim();
    if (!nextName || !nextEmail) {
      setProfileInfo("Ad soyad ve e-posta zorunludur.");
      return;
    }
    setStoredUser(nextName, nextEmail);
    setName(nextName);
    setEmail(nextEmail);
    setDisplayName(nextName);
    setProfileInfo("Bilgileriniz güncellendi.");
  }

  function onLogout() {
    clearStoredUser();
    setName("");
    setEmail("");
    setDisplayName("");
    setFormName("");
    setFormEmail("");
    setProfileInfo("");
    setIsEditorOpen(false);
  }

  return (
    <header className="border-b border-[#e3e8f1] bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-lg font-semibold text-[#102040]">
            <span className="inline-block h-3 w-3 rounded-full bg-[#2b68ff]" />
            <span>Near East Ulaşım</span>
          </div>
          <nav className="hidden items-center gap-2 text-sm md:flex">
            <Link href="/" className={navClass(active === "home")}>Ana Sayfa</Link>
            <Link href="/search-buses" className={navClass(active === "search")}>Otobüs Ara</Link>
            <Link href="/track-bus" className={navClass(active === "track")}>Sefer Takibi</Link>
            <Link href="/my-bookings" className={navClass(active === "bookings")}>Rezervasyonlarım</Link>
          </nav>
        </div>
        <div className="relative flex items-center gap-2 text-xs sm:text-sm">
          {displayName ? (
            <button
              type="button"
              onClick={() => setIsEditorOpen((current) => !current)}
              className="rounded-md px-3 py-1.5 text-[#24324f] hover:bg-[#f1f4fa]"
            >
              {displayName}
            </button>
          ) : (
            <Link href="/login" className="rounded-md px-3 py-1.5 text-[#24324f]">
              Giriş
            </Link>
          )}

          {isEditorOpen ? (
            <div className="absolute right-0 top-11 z-20 w-72 rounded-xl border border-[#d8deec] bg-white p-3 shadow-lg">
              <p className="text-sm font-semibold text-[#1a2640]">Kişisel Bilgiler</p>
              <p className="mt-1 text-xs text-[#5f6d88]">Adınıza tıklayarak bilgilerinizi güncelleyebilirsiniz.</p>
              <div className="mt-3 space-y-2">
                <input
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  placeholder="Örn: Cem Çalış"
                  className="w-full rounded-md border border-[#d8deec] px-3 py-2 text-sm"
                />
                <input
                  value={formEmail}
                  onChange={(event) => setFormEmail(event.target.value)}
                  placeholder="Örn: cem@example.com"
                  className="w-full rounded-md border border-[#d8deec] px-3 py-2 text-sm"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSaveProfile}
                    className="rounded-md bg-[#2a64e8] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Kaydet
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="rounded-md border border-[#f0c5cc] px-3 py-1.5 text-xs font-medium text-[#d34255]"
                  >
                    Çıkış Yap
                  </button>
                </div>
                {profileInfo ? <p className="text-xs text-[#2a64e8]">{profileInfo}</p> : null}
                {name && email ? <p className="text-[11px] text-[#6a7894]">{email}</p> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
