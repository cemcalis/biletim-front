"use client";

import Link from "next/link";
import { ReactNode } from "react";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { CollapsibleSidebar, SidebarItem } from "@/components/collapsible-sidebar";

export type AdminRole = "super-admin" | "company-admin";

type AdminPageShellProps = {
  title: string;
  subtitle: string;
  active: string;
  username: string;
  role: AdminRole;
  onRoleChange: (role: AdminRole) => void;
  onLogout: () => void;
  items: SidebarItem[];
  children: ReactNode;
  company?: string;
  companyOptions?: string[];
  onCompanyChange?: (company: string) => void;
  primaryActionHref?: string;
  primaryActionLabel?: string;
  topBadgeLabel?: string;
};

export function AdminPageShell({
  title,
  subtitle,
  active,
  username,
  role,
  onRoleChange,
  onLogout,
  items,
  children,
  company = "all",
  companyOptions = ["all"],
  onCompanyChange,
  primaryActionHref = "/admin#trips",
  primaryActionLabel = "Sefer Oluştur",
  topBadgeLabel = "Yönetim Paneli",
}: AdminPageShellProps) {
  const roleOptions: Array<{ value: AdminRole; label: string }> = [
    { value: "super-admin", label: "Admin" },
    { value: "company-admin", label: "Firma" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#15213a",
        overflowX: "hidden",
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 2, pb: 3 }}>
        <Box sx={{ display: "grid", gap: 2.25, gridTemplateColumns: { xs: "1fr", lg: "280px minmax(0, 1fr)" }, alignItems: "start" }}>
          <Box sx={{ minWidth: 0, position: { lg: "sticky" }, top: { lg: 16 } }}>
            <CollapsibleSidebar
              title={title}
              subtitle={subtitle}
              items={items}
              active={active}
              onLogout={onLogout}
              showLogout={false}
            />
          </Box>

          <Box sx={{ minWidth: 0, display: "grid", gap: 2.25 }}>
            <Paper
              elevation={0}
              sx={{
                position: "sticky",
                top: 16,
                zIndex: 20,
                display: "grid",
                gap: 1.75,
                p: 2,
                borderRadius: 3,
                border: "1px solid #dde4f1",
                boxShadow: "none",
                background: "#ffffff",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#1f3971", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Near East
                </Typography>
                <Typography sx={{ mt: -0.25, fontSize: "1.55rem", fontWeight: 800, letterSpacing: "-0.04em", color: "#2c3340", lineHeight: 1 }}>
                  Ulasim
                </Typography>
                <Typography sx={{ mt: 0.5, fontSize: "0.78rem", color: "#6c768b" }}>
                  Tek panelden merkezi yonetim
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "1fr", md: onCompanyChange ? "180px 180px auto auto auto" : "180px auto auto auto" }, alignItems: "center" }}>
                {onCompanyChange ? (
                  <TextField select size="small" value={company} onChange={(event) => onCompanyChange(event.target.value)} label="Firma" sx={{ width: "100%" }}>
                    {companyOptions.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item === "all" ? "Tüm şirketler" : item}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : null}

                <TextField select size="small" value={role} onChange={(event) => onRoleChange(event.target.value as AdminRole)} label="Rol" sx={{ width: "100%" }}>
                  {roleOptions.map((item) => (
                    <MenuItem key={item.value} value={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Button
                  component={Link}
                  href={primaryActionHref}
                  variant="contained"
                  disableElevation
                  startIcon={<AddCircleOutlineOutlinedIcon />}
                  sx={{ minHeight: 42, textTransform: "none", borderRadius: 3, background: "#1f3971", boxShadow: "none", "&:hover": { background: "#264a90" } }}
                >
                  {primaryActionLabel}
                </Button>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1.5, py: 1.1, borderRadius: 3, background: "#fff", border: "1px solid #dbe3ef", minWidth: 0 }}>
                  <AccountCircleOutlinedIcon sx={{ color: "#1f3971" }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, lineHeight: 1.1 }}>{username}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#6c768b", lineHeight: 1.1 }}>{topBadgeLabel}</Typography>
                  </Box>
                  <KeyboardArrowDownRoundedIcon sx={{ ml: "auto", color: "#758199" }} />
                </Box>

                <Button onClick={onLogout} variant="outlined" sx={{ minHeight: 42, textTransform: "none", borderRadius: 3, borderColor: "#d9e0ec", color: "#24324f", boxShadow: "none" }}>
                  Çıkış Yap
                </Button>
              </Box>
            </Paper>

            {children}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}