import Link from "next/link";
import { Box, Container, Divider, Typography } from "@mui/material";

export function CorporateFooter() {
  return (
    <Box sx={{ mt: 6, width: "100%", borderTop: "1px solid #dbe3f1", bgcolor: "#fff" }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 4 } }}>
        <Box sx={{ p: { xs: 3, sm: 4 }, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "1.4fr 1fr 1fr" } }}>
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#13223f" }}>Near East Ulaşım</Typography>
            <Typography sx={{ mt: 1, fontSize: "0.86rem", color: "#5d6c87" }}>
              Ne güzel şey, düşünülmek...
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#13223f" }}>Hızlı Bağlantılar</Typography>
            <Box sx={{ mt: 1, display: "grid", gap: 0.75 }}>
              <Typography component={Link} href="/" sx={{ color: "#2a64e8", textDecoration: "none", fontSize: "0.85rem" }}>Ana sayfa</Typography>
              <Typography component={Link} href="/search-buses" sx={{ color: "#2a64e8", textDecoration: "none", fontSize: "0.85rem" }}>Sefer ara</Typography>
              <Typography component={Link} href="/company" sx={{ color: "#2a64e8", textDecoration: "none", fontSize: "0.85rem" }}>Firma paneli</Typography>
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#13223f" }}>İletişim</Typography>
            <Typography sx={{ mt: 1, fontSize: "0.85rem", color: "#5d6c87" }}>destek@neareastulasim.com</Typography>
            <Typography sx={{ fontSize: "0.85rem", color: "#5d6c87" }}>+90 212 000 00 00</Typography>
          </Box>
        </Box>
        <Divider />
        <Box sx={{ px: { xs: 0, sm: 0 }, py: 1.5, display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "0.78rem", color: "#6a7894" }}>© 2026 Near East Ulaşım</Typography>
          <Typography sx={{ fontSize: "0.78rem", color: "#6a7894" }}>Tüm hakları saklıdır.</Typography>
        </Box>
      </Container>
    </Box>
  );
}
