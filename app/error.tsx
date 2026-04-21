"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
            width: 72,
            height: 72,
            bgcolor: "#fef2f2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <ReportProblemOutlinedIcon sx={{ fontSize: 36, color: "#dc2626" }} />
        </Box>

        <Typography
          component="h1"
          sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", mb: 1 }}
        >
          Beklenmedik Bir Hata Oluştu
        </Typography>

        <Typography
          sx={{ fontSize: "0.9rem", color: "#64748b", mb: 1, lineHeight: 1.75 }}
        >
          {error.message || "Bir şeyler yanlış gitti. Lütfen tekrar deneyin."}
        </Typography>

        {error.digest && (
          <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace", mb: 3 }}>
            Hata Kodu: {error.digest}
          </Typography>
        )}

        <Button
          onClick={reset}
          variant="contained"
          sx={{
            bgcolor: "#002D62",
            "&:hover": { bgcolor: "#001f44" },
            textTransform: "none",
            fontWeight: 700,
            px: 4,
            py: 1.25,
          }}
        >
          Tekrar Dene
        </Button>
      </Container>
    </Box>
  );
}
