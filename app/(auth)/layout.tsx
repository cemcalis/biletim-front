import { PropsWithChildren } from "react";
import { Box, Container } from "@mui/material";
import Link from "next/link";
import Typography from "@mui/material/Typography";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <Box sx={{ py: 3, px: 4, display: "flex", justifyContent: "center" }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "8px" }}>
          <Box sx={{ width: 24, height: 24, bgcolor: "#D4AF37", borderRadius: "3px" }} />
          <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "#002D62" }}>
            Near East Way
          </Typography>
        </Link>
      </Box>
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
        {children}
      </Box>
    </Box>
  );
}
