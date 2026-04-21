import { PropsWithChildren } from "react";
import { Box } from "@mui/material";
import UserNavbar from "@/components/user-navbar";
import { CorporateFooter } from "@/components/corporate-footer";

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <UserNavbar />
      <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </Box>
      <CorporateFooter />
    </Box>
  );
}
