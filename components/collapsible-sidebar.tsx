"use client";

import { useEffect, useState, type ElementType } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  Button,
  Divider,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DirectionsBusFilledRoundedIcon from "@mui/icons-material/DirectionsBusFilledRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import styles from "./collapsible-sidebar.module.css";

export type SidebarItem = {
  label: string;
  href: string;
  key: string;
};

export type CollapsibleSidebarProps = {
  title: string;
  subtitle: string;
  items: SidebarItem[];
  active: string;
  onLogout: () => void;
  showLogout?: boolean;
  secondaryButton?: {
    label: string;
    href: string;
  };
};

export function CollapsibleSidebar({
  title,
  subtitle,
  items,
  active,
  onLogout,
  showLogout = true,
  secondaryButton,
}: CollapsibleSidebarProps) {
  const iconByKey: Record<string, ElementType> = {
    overview: DashboardRoundedIcon,
    trips: DirectionsBusFilledRoundedIcon,
    requests: BusinessRoundedIcon,
    users: GroupRoundedIcon,
    reports: BarChartRoundedIcon,
    settings: SettingsRoundedIcon,
  };

  const discoverItems = items.filter((item) => ["overview", "trips", "requests"].includes(item.key));
  const managementItems = items.filter((item) => ["users", "reports", "settings"].includes(item.key));
  const remainingItems = items.filter((item) => !["overview", "trips", "requests", "users", "reports", "settings"].includes(item.key));

  const [open, setOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("admin_sidebar_collapsed");
    if (stored === "1") {
      setDesktopCollapsed(true);
    }
  }, []);

  const toggleDesktop = () => {
    setDesktopCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_collapsed", next ? "1" : "0");
      return next;
    });
  };

  const toggleDrawer = (state: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === "keydown" && ((event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift")) {
      return;
    }
    setOpen(state);
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout();
  };

  const hasActions = showLogout || Boolean(secondaryButton);

  return (
    <>
      <Box className={styles.mobileToggleWrap}>
        <IconButton onClick={toggleDrawer(true)} className={styles.mobileToggleButton}>
          <MenuIcon />
        </IconButton>
      </Box>

      <Drawer
        open={open}
        onClose={toggleDrawer(false)}
        slotProps={{
          paper: {
            className: styles.drawerPaper,
          },
        }}
      >
        <Box className={styles.drawerHeader}>
          <Box>
            <Typography className={styles.title}>{title}</Typography>
            <Typography className={styles.subtitleMobile}>{subtitle}</Typography>
          </Box>
          <IconButton onClick={toggleDrawer(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box className={styles.drawerContent}>
          {!!discoverItems.length ? <Typography className={styles.menuGroupLabel}>Discover</Typography> : null}
          <List disablePadding className={styles.menuList}>
            {discoverItems.map((item) => {
              const selected = active === item.key;
              const ItemIcon = iconByKey[item.key] ?? DashboardRoundedIcon;
              return (
                <ListItemButton
                  key={item.key}
                  component="a"
                  href={item.href}
                  onClick={toggleDrawer(false)}
                  selected={selected}
                  className={styles.menuItem}
                >
                  <Box className={styles.menuItemIconWrap}>
                    <ItemIcon className={styles.menuItemIcon} />
                  </Box>
                  <ListItemText primary={item.label} className={styles.menuItemText} />
                </ListItemButton>
              );
            })}
          </List>

          {!!managementItems.length ? <Typography className={styles.menuGroupLabel}>Management</Typography> : null}
          <List disablePadding className={styles.menuListSecondary}>
            {[...managementItems, ...remainingItems].map((item) => {
              const selected = active === item.key;
              const ItemIcon = iconByKey[item.key] ?? DashboardRoundedIcon;
              return (
                <ListItemButton
                  key={item.key}
                  component="a"
                  href={item.href}
                  onClick={toggleDrawer(false)}
                  selected={selected}
                  className={styles.menuItem}
                >
                  <Box className={styles.menuItemIconWrap}>
                    <ItemIcon className={styles.menuItemIcon} />
                  </Box>
                  <ListItemText primary={item.label} className={styles.menuItemText} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {hasActions ? (
          <>
            <Divider className={styles.drawerDivider} />

            <Box className={styles.actions}>
              {secondaryButton && (
                <Button
                  component="a"
                  href={secondaryButton.href}
                  onClick={toggleDrawer(false)}
                  variant="outlined"
                  className={styles.secondaryButton}
                >
                  {secondaryButton.label}
                </Button>
              )}
              {showLogout && (
                <Button onClick={handleLogout} variant="contained" disableElevation className={styles.logoutButton}>
                  Çıkış Yap
                </Button>
              )}
            </Box>
          </>
        ) : null}
      </Drawer>

      <Paper elevation={0} className={`${styles.desktopSidebar} ${desktopCollapsed ? styles.desktopSidebarCollapsed : ""}`}>
        <Box className={styles.desktopHeader}>
          <Box>
            <Typography className={styles.title}>{desktopCollapsed ? title.slice(0, 2).toUpperCase() : title}</Typography>
            {!desktopCollapsed ? <Typography className={styles.subtitleDesktop}>{subtitle}</Typography> : null}
          </Box>

          <Tooltip title={desktopCollapsed ? "Menüyü aç" : "Menüyü kapat"}>
            <IconButton onClick={toggleDesktop} size="small" className={styles.desktopCollapseButton}>
              {desktopCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {!!discoverItems.length && !desktopCollapsed ? <Typography className={styles.menuGroupLabel}>Discover</Typography> : null}
        <List disablePadding className={styles.desktopMenuList}>
          {discoverItems.map((item) => {
            const ItemIcon = iconByKey[item.key] ?? DashboardRoundedIcon;
            const menuButton = (
              <ListItemButton
                key={item.key}
                component="a"
                href={item.href}
                selected={active === item.key}
                className={`${styles.menuItem} ${desktopCollapsed ? styles.menuItemCollapsed : ""}`}
              >
                <Box className={styles.menuItemIconWrap}>
                  <ItemIcon className={styles.menuItemIcon} />
                </Box>
                <ListItemText primary={desktopCollapsed ? "" : item.label} className={`${styles.menuItemText} ${desktopCollapsed ? styles.menuItemTextCollapsed : ""}`} />
              </ListItemButton>
            );

            if (!desktopCollapsed) {
              return menuButton;
            }

            return (
              <Tooltip key={item.key} title={item.label} placement="right">
                {menuButton}
              </Tooltip>
            );
          })}
        </List>

        {!!managementItems.length && !desktopCollapsed ? <Typography className={styles.menuGroupLabel}>Management</Typography> : null}
        <List disablePadding className={styles.desktopMenuList}>
          {[...managementItems, ...remainingItems].map((item) => {
            const ItemIcon = iconByKey[item.key] ?? DashboardRoundedIcon;
            const menuButton = (
              <ListItemButton
                key={item.key}
                component="a"
                href={item.href}
                selected={active === item.key}
                className={`${styles.menuItem} ${desktopCollapsed ? styles.menuItemCollapsed : ""}`}
              >
                <Box className={styles.menuItemIconWrap}>
                  <ItemIcon className={styles.menuItemIcon} />
                </Box>
                <ListItemText primary={desktopCollapsed ? "" : item.label} className={`${styles.menuItemText} ${desktopCollapsed ? styles.menuItemTextCollapsed : ""}`} />
              </ListItemButton>
            );

            if (!desktopCollapsed) {
              return menuButton;
            }

            return (
              <Tooltip key={item.key} title={item.label} placement="right">
                {menuButton}
              </Tooltip>
            );
          })}
        </List>

        <Box className={`${styles.desktopActions} ${desktopCollapsed ? styles.desktopActionsCollapsed : ""}`}>
          {!desktopCollapsed && secondaryButton && (
            <Button component="a" href={secondaryButton.href} variant="outlined" className={styles.secondaryButton}>
              {secondaryButton.label}
            </Button>
          )}
          {showLogout && !desktopCollapsed && (
            <Button onClick={onLogout} variant="contained" disableElevation className={styles.logoutButton}>
              Çıkış Yap
            </Button>
          )}
          {showLogout && desktopCollapsed ? (
            <Tooltip title="Çıkış Yap">
              <IconButton onClick={onLogout} className={styles.compactLogoutButton}>
                <LogoutOutlinedIcon />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>
      </Paper>
    </>
  );
}
