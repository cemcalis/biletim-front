import { Box, CircularProgress } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8f9fa",
      }}
    >
      <CircularProgress sx={{ color: "#002D62" }} />
    </Box>
  );
}
