"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Box, Button, MenuItem, Paper, Select, Typography } from "@mui/material";
import { CollapsibleSidebar, type SidebarItem } from "./collapsible-sidebar";

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
  primaryActionHref?: string;
  primaryActionLabel?: string;
  topBadgeLabel?: string;
  children: ReactNode;
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
  primaryActionHref,
  primaryActionLabel,
  topBadgeLabel,
  children,
}: AdminPageShellProps) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f7fb" }}>
      <CollapsibleSidebar
        title={title}
        subtitle={subtitle}
        items={items}
        active={active}
        onLogout={onLogout}
        secondaryButton={primaryActionHref && primaryActionLabel ? { href: primaryActionHref, label: primaryActionLabel } : undefined}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0, p: { xs: 2, md: 3 }, display: "flex", flexDirection: "column", gap: 2 }}>
        <Paper elevation={0} sx={{ px: 2.5, py: 2, borderRadius: 3, border: "1px solid #dde4f1", boxShadow: "none", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)" }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>{title}</Typography>
              <Typography sx={{ mt: 0.5, fontSize: "0.84rem", color: "#6c768b" }}>{subtitle}</Typography>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.25 }}>
              {topBadgeLabel ? (
                <Box sx={{ display: "inline-flex", alignItems: "center", px: 1.5, py: 1, borderRadius: 999, background: "#eef4ff", color: "#2b60d4", fontSize: "0.8rem", fontWeight: 700 }}>
                  {topBadgeLabel}
                </Box>
              ) : null}

              <Select
                size="small"
                value={role}
                onChange={(event) => {
                  const nextRole = event.target.value as AdminRole;
                  localStorage.setItem("admin_role", nextRole);
                  onRoleChange(nextRole);
                }}
                sx={{ minWidth: 180, background: "#ffffff" }}
              >
                <MenuItem value="super-admin">Sistem Yöneticisi</MenuItem>
                <MenuItem value="company-admin">Firma Yetkilisi</MenuItem>
              </Select>

              <Box sx={{ display: "grid", gap: 0.1, textAlign: { xs: "left", sm: "right" } }}>
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: "#1d2d4d" }}>{username}</Typography>
                <Typography sx={{ fontSize: "0.74rem", color: "#6c768b" }}>{role === "company-admin" ? "Firma paneli" : "Sistem paneli"}</Typography>
              </Box>

              <Button component={Link} href={primaryActionHref ?? "/admin"} variant="outlined" sx={{ textTransform: "none", borderRadius: 2, fontWeight: 700 }}>
                {primaryActionLabel ?? "Ana Panele Dön"}
              </Button>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}