import { PropsWithChildren } from "react";
import { Box } from "@mui/material";
import UserNavbar from "@/components/user-navbar";
import { CorporateFooter } from "@/components/corporate-footer";

export default function CustomerLayout({ children }: PropsWithChildren) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#f8f9fa" }}>
      <UserNavbar />
      <Box sx={{ flex: 1 }}>
        {children}
      </Box>
      <CorporateFooter />
    </Box>
  );
}
