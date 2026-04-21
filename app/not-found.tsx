import { Box, Container, Typography } from "@mui/material";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8f9fa",
        textAlign: "center",
        px: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            width: 80,
            height: 80,
            bgcolor: "#f1f5f9",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <SearchOffOutlinedIcon sx={{ fontSize: 40, color: "#94a3b8" }} />
        </Box>

        <Typography
          component="h1"
          sx={{ fontSize: "4rem", fontWeight: 900, color: "#002D62", lineHeight: 1, mb: 1 }}
        >
          404
        </Typography>

        <Typography
          sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", mb: 1 }}
        >
          Sayfa Bulunamadı
        </Typography>

        <Typography
          sx={{ fontSize: "0.95rem", color: "#64748b", mb: 4, lineHeight: 1.75 }}
        >
          Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
        </Typography>

        <a
          href="/"
          style={{
            display: "inline-block",
            background: "#002D62",
            color: "#ffffff",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.95rem",
            padding: "12px 32px",
            borderRadius: "6px",
          }}
        >
          Ana Sayfaya Dön
        </a>
      </Container>
    </Box>
  );
}
