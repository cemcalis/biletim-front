import { Box, Container, Typography } from "@mui/material";

type CorporateBannerProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
};

export function CorporateBanner({
  title,
  subtitle,
  eyebrow = "Near East Way",
}: CorporateBannerProps) {
  return (
    <Box sx={{ bgcolor: "#002D62", color: "#ffffff", py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4 } }}>
        {eyebrow && (
          <Typography
            sx={{
              fontSize: "0.72rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#D4AF37",
              mb: 1.5,
              fontWeight: 700,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: "1.6rem", sm: "2rem" },
            fontWeight: 800,
            lineHeight: 1.2,
            color: "#ffffff",
            fontFamily: "var(--font-display), 'Playfair Display', serif",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            mt: 1.5,
            maxWidth: 680,
            fontSize: "0.95rem",
            color: "#c8d8ea",
            lineHeight: 1.7,
          }}
        >
          {subtitle}
        </Typography>
      </Container>
    </Box>
  );
}
