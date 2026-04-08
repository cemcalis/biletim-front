"use client";

import { FormEvent, useEffect, useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { CollapsibleSidebar } from "@/components/collapsible-sidebar";
import { apiGet, apiRequest } from "../../lib/api";
import styles from "./page.module.css";

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
      <Box className={styles.loginRoot}>
        <Container maxWidth="sm">
          <Paper elevation={0} className={styles.loginCard}>
            <Typography className={styles.title}>Admin Girişi</Typography>
          
            <Box component="form" onSubmit={onLogin} className={styles.loginForm}>
              <TextField size="small" value={username} onChange={(event) => setUsername(event.target.value)} label="Kullanıcı adı" />
              <TextField size="small" value={password} onChange={(event) => setPassword(event.target.value)} label="Şifre" type="password" />
              <Button type="submit" variant="contained" disableElevation className={styles.primaryButton}>
                Giriş Yap
              </Button>
            </Box>
            {loginError ? <Typography className={styles.loginError}>{loginError}</Typography> : null}
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box className={styles.pageRoot}>
      <Container maxWidth="lg" className={styles.mainContainer}>
        <Box className={styles.workspaceLayout}>
          <Box className={styles.sidebarColumn}>
            <CollapsibleSidebar
              title="Admin Menü"
              subtitle="Yönetim araçları"
              items={[
                { label: "Ana Sayfa", href: "#", key: "overview" },
                { label: "Firma Başvuruları", href: "#requests", key: "requests" },
              ]}
              active="overview"
              onLogout={onLogout}
              showLogout={true}
            />
          </Box>

          <Box className={styles.mainContainer}>
          <Paper elevation={0} className={styles.pageCard}>
            <Box className={styles.headerWrap}>
              <Box>
                <Typography className={styles.title}>Admin Paneli</Typography>
                <Typography className={styles.subtitle}>Firma onayları ve genel metrikler</Typography>
              </Box>
              <Button onClick={onLogout} variant="outlined" className={styles.logoutButton}>
                Çıkış Yap
              </Button>
            </Box>
            <Box className={styles.metricGrid}>
              {[
                { label: "Rezervasyon", value: overview?.metrics.totalBookings ?? 0 },
                { label: "Aktif Kullanıcı", value: overview?.metrics.activeUsers ?? 0 },
                { label: "Hat", value: overview?.metrics.busRoutes ?? 0 },
                { label: "Gelir", value: `₺${overview?.metrics.revenue ?? 0}` },
              ].map((item) => (
                <Paper key={item.label} elevation={0} className={styles.metricCard}>
                  <Typography className={styles.metricLabel}>{item.label}</Typography>
                  <Typography className={styles.metricValue}>{item.value}</Typography>
                </Paper>
              ))}
            </Box>
            {info ? <Typography className={styles.infoText}>{info}</Typography> : null}
          </Paper>

          <Paper id="requests" elevation={0} className={styles.pageCard}>
            <Typography className={styles.sectionTitle}>Bekleyen Firma Kayıtları</Typography>
            {!requests.length ? <Typography className={styles.emptyText}>Bekleyen başvuru yok.</Typography> : null}
            <Box className={styles.listGrid}>
              {requests.map((request) => (
                <Paper key={request.id} elevation={0} className={styles.requestCard}>
                  <Typography className={styles.requestTitle}>{request.companyName}</Typography>
                  <Typography className={styles.requestMetaSpaced}>Yetkili: {request.contactName}</Typography>
                  <Typography className={styles.requestMeta}>E-posta: {request.email}</Typography>
                  <Button onClick={() => void onApprove(request.id)} variant="contained" disableElevation className={styles.approveButton}>
                    Onayla
                  </Button>
                </Paper>
              ))}
            </Box>
          </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
