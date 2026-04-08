"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
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
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fa", px: 2, py: 6, color: "#12203a" }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, border: "1px solid #dce3f1", boxShadow: "none" }}>
          <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, letterSpacing: "-0.03em" }}>Firma Kayıt Başvurusu</Typography>
          <Typography sx={{ mt: 1, fontSize: "0.9rem", color: "#5b6b87" }}>Admin onayı sonrası firma paneline giriş yapabilirsiniz.</Typography>
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 3, display: "grid", gap: 1.5 }}>
            <TextField size="small" value={companyName} onChange={(event) => setCompanyName(event.target.value)} label="Firma adı" />
            <TextField size="small" value={contactName} onChange={(event) => setContactName(event.target.value)} label="Yetkili adı" />
            <TextField size="small" value={email} onChange={(event) => setEmail(event.target.value)} label="Firma e-posta" type="email" />
            <TextField size="small" value={password} onChange={(event) => setPassword(event.target.value)} label="Şifre" type="password" />
            <Button type="submit" variant="contained" disableElevation sx={{ alignSelf: "start", textTransform: "none", bgcolor: "#2a64e8", boxShadow: "none" }}>
              Başvuru Gönder
            </Button>
          </Box>
          {message ? <Typography sx={{ mt: 2, fontSize: "0.82rem", color: "#2a64e8" }}>{message}</Typography> : null}
          <Typography sx={{ mt: 2.5, fontSize: "0.88rem", color: "#5b6b87" }}>
            Firma paneline dönmek için
            <Box component={Link} href="/company" sx={{ ml: 0.75, color: "#2a64e8", fontWeight: 600, textDecoration: "none" }}>
              giriş sayfası
            </Box>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
