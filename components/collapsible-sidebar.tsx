"use client";

import { useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
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
  const [open, setOpen] = useState(false);

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
          <List disablePadding className={styles.menuList}>
            {items.map((item) => {
              const selected = active === item.key;
              return (
                <ListItemButton
                  key={item.key}
                  component="a"
                  href={item.href}
                  onClick={toggleDrawer(false)}
                  selected={selected}
                  className={styles.menuItem}
                >
                  <ListItemText primary={item.label} className={styles.menuItemText} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

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
      </Drawer>

      <Paper elevation={0} className={styles.desktopSidebar}>
        <Typography className={styles.title}>{title}</Typography>
        <Typography className={styles.subtitleDesktop}>{subtitle}</Typography>

        <List disablePadding className={styles.desktopMenuList}>
          {items.map((item) => {
            return (
              <ListItemButton
                key={item.key}
                component="a"
                href={item.href}
                selected={active === item.key}
                className={styles.menuItem}
              >
                <ListItemText primary={item.label} className={styles.menuItemText} />
              </ListItemButton>
            );
          })}
        </List>

        <Box className={styles.desktopActions}>
          {secondaryButton && (
            <Button component="a" href={secondaryButton.href} variant="outlined" className={styles.secondaryButton}>
              {secondaryButton.label}
            </Button>
          )}
          {showLogout && (
            <Button onClick={onLogout} variant="contained" disableElevation className={styles.logoutButton}>
              Çıkış Yap
            </Button>
          )}
        </Box>
      </Paper>
    </>
  );
}
