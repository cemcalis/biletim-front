"use client";

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-sans), "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: 'var(--font-display), "Playfair Display", serif' },
    h2: { fontFamily: 'var(--font-display), "Playfair Display", serif' },
    h3: { fontFamily: 'var(--font-display), "Playfair Display", serif' },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
  },
  palette: {
    primary: {
      main: "#002D62",
      light: "#003b80",
      dark: "#001a3d",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#D4AF37", // Gold
      light: "#e0c266",
      dark: "#b8942b",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#64748b",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&:hover": {
            transform: "translateY(-1px)",
            transition: "transform 0.2s ease-in-out",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
        },
      },
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
