"use client";

import { useEffect } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f9fafb",
        p: 3,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 400,
          textAlign: "center",
          borderRadius: 4,
          border: "1px solid #e5e7eb",
        }}
      >
        <ReportProblemOutlinedIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          Bir Hata Oluştu
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {error.message || "Sayfa yüklenirken beklenmedik bir sorunla karşılaştık."}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => reset()}
          size="large"
          disableElevation
          sx={{ borderRadius: 2, textTransform: "none", px: 4 }}
        >
          Tekrar Dene
        </Button>
      </Paper>
    </Box>
  );
}
