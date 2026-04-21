"use client";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PropsWithChildren, useMemo, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { GOOGLE_CLIENT_ID, hasGoogleClientId } from "@/lib/google-config";

export function Providers({ children }: PropsWithChildren) {
  const [cache] = useState(() => createCache({ key: "mui", prepend: true }));

  useServerInsertedHTML(() => {
    const insertedNames = Object.keys(cache.inserted);
    if (insertedNames.length === 0) {
      return null;
    }

    let css = "";
    for (const name of insertedNames) {
      const style = cache.inserted[name];
      if (typeof style === "string") {
        css += style;
      }
    }

    return (
      <style
        data-emotion={`${cache.key} ${insertedNames.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: css }}
      />
    );
  });

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

  const content = (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );

  if (!hasGoogleClientId()) {
    return content;
  }

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider>;
}
