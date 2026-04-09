"use client";

import { Box, Container, Paper, Typography } from "@mui/material";
import { CorporateFooter } from "@/components/corporate-footer";
import UserNavbar from "@/components/user-navbar";


export default function CampaignsPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef2f8" }}>
      <UserNavbar active="home" variant="default" />

      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 4 }, py: { xs: 3, md: 5 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 2.25, md: 3 }, borderColor: "#d9e0ee", borderRadius: 2, boxShadow: "none", bgcolor: "#ffffff" }}>
          <Typography sx={{ fontSize: { xs: "1.4rem", md: "1.85rem" }, fontWeight: 800, color: "#1f3971" }}>Kampanyalar</Typography>
          <Typography sx={{ mt: 1, fontSize: "0.9rem", color: "#5d6c87" }}>
            Guncel indirimleri ve ozel firsatlari buradan takip edebilirsiniz.
          </Typography>

          <Box
            sx={{
              mt: 2.5,
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            }}
          >
            {[
              {
                title: "Erken Rezervasyon",
                description: "Belirli hatlarda erken bilet alimina ozel %20 indirim.",
              },
              {
                title: "Ogrenci Avantaji",
                description: "Ogrenci kimligi ile secili seferlerde ek fiyat avantaji.",
              },
              {
                title: "Hafta Ici Kampanyasi",
                description: "Pazartesi-Persembe gunleri secili rotalarda uygun fiyat.",
              },
            ].map((item) => (
              <Paper key={item.title} variant="outlined" sx={{ p: 2, borderColor: "#dce3ef", borderRadius: 2, boxShadow: "none", bgcolor: "#f7f9fd" }}>
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#1f3971" }}>{item.title}</Typography>
                <Typography sx={{ mt: 1, fontSize: "0.82rem", color: "#5d6c87" }}>{item.description}</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Container>

      <CorporateFooter />
    </Box>
  );
}