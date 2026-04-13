"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PropsWithChildren, useMemo } from "react";

export function Providers({ children }: PropsWithChildren) {
  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily:
            'var(--font-sans), "Source Sans 3", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          h1: {
            fontFamily:
              'var(--font-display), "Merriweather", Georgia, "Times New Roman", serif',
            fontWeight: 900,
          },
          h2: {
            fontFamily:
              'var(--font-display), "Merriweather", Georgia, "Times New Roman", serif',
            fontWeight: 900,
          },
          h3: {
            fontFamily:
              'var(--font-display), "Merriweather", Georgia, "Times New Roman", serif',
            fontWeight: 700,
          },
          h4: {
            fontFamily:
              'var(--font-display), "Merriweather", Georgia, "Times New Roman", serif',
            fontWeight: 700,
          },
          h5: {
            fontFamily:
              'var(--font-display), "Merriweather", Georgia, "Times New Roman", serif',
            fontWeight: 700,
          },
          h6: {
            fontFamily:
              'var(--font-display), "Merriweather", Georgia, "Times New Roman", serif',
            fontWeight: 700,
          },
          button: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
      }),
    [],
  );

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
