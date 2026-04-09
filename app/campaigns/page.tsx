"use client";

import { Box, Container, Paper, Typography } from "@mui/material";
import EarlyOnOutlinedIcon from "@mui/icons-material/TimerOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { CorporateBanner } from "@/components/corporate-banner";
import { CorporateFooter } from "@/components/corporate-footer";
import UserNavbar from "@/components/user-navbar";

const CAMPAIGNS = [
  {
    icon: <EarlyOnOutlinedIcon sx={{ fontSize: 26, color: "#002D62" }} />,
    title: "Erken Rezervasyon",
    description: "Belirlenen hatlarda erken satın alımlara özel %20 indirim fırsatı. Seyahat tarihinizden en az 7 gün önce rezervasyon yapın.",
    badge: "%20 İndirim",
  },
  {
    icon: <SchoolOutlinedIcon sx={{ fontSize: 26, color: "#002D62" }} />,
    title: "Öğrenci Avantajı",
    description: "Geçerli öğrenci kimliği ile seçili seferlerde ek fiyat avantajı. Ayrıntılar için müşteri hizmetleri ile iletişime geçin.",
    badge: "Öğrenciye Özel",
  },
  {
    icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 26, color: "#002D62" }} />,
    title: "Hafta İçi Kampanyası",
    description: "Pazartesi - Perşembe günleri yapılan rezervasyonlarda seçili rotalarda avantajlı fiyat uygulaması.",
    badge: "Pt – Prş",
  },
];

export default function CampaignsPage() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8f9fa" }}>
      <UserNavbar active="home" />
      <CorporateBanner
        eyebrow="Fırsatlar"
        title="Güncel Kampanyalar"
        subtitle="Biletim A.Ş. müşterilerine özel indirim ve fırsat kampanyaları."
      />

      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4 }, py: 6, flex: 1 }}>
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          }}
        >
          {CAMPAIGNS.map((item) => (
            <Paper
              key={item.title}
              elevation={0}
              sx={{
                p: 3.5,
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: "0 4px 16px -4px rgba(0,0,0,0.08)" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ width: 48, height: 48, bgcolor: "#f1f5f9", borderRadius: 1.5, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.icon}
                </Box>
                <Box sx={{ px: 1.25, py: 0.5, bgcolor: "#002D62", borderRadius: 1 }}>
                  <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#D4AF37" }}>
                    {item.badge}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography sx={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.75 }}>
                  {item.description}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Paper elevation={0} sx={{ mt: 4, p: 3, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#f8fafc" }}>
          <Typography sx={{ fontSize: "0.875rem", color: "#64748b", lineHeight: 1.75 }}>
            Kampanya koşulları ve detaylı bilgi için{" "}
            <Box component="span" sx={{ color: "#002D62", fontWeight: 700 }}>
              444 0 000
            </Box>{" "}
            numaralı müşteri hizmetleri hattımızı aramanız ya da{" "}
            <Box component="span" sx={{ color: "#002D62", fontWeight: 700 }}>
              info@biletim-as.com.tr
            </Box>{" "}
            adresine e-posta göndermeniz yeterlidir.
          </Typography>
        </Paper>
      </Container>

      <CorporateFooter />
    </Box>
  );
}