import { Box, Container, Paper, Typography } from "@mui/material";

type CorporateBannerProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
};

export function CorporateBanner({
  title,
  subtitle,
  eyebrow = "Otübs Ulaşım Platformu",
}: CorporateBannerProps) {
  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #dbe3f1",
          bgcolor: "#86a8ec",
          color: "#fff",
          boxShadow: "none",
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.72)",
            }}
          >
            {eyebrow}
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: { xs: "1.6rem", sm: "2.2rem" },
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              mt: 1.25,
              maxWidth: 760,
              fontSize: "0.95rem",
              color: "rgba(255,255,255,0.82)",
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
