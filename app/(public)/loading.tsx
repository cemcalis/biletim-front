import { Box, CircularProgress } from "@mui/material";

export default function PublicLoading() {
  return (
    <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 12 }}>
      <CircularProgress sx={{ color: "#002D62" }} />
    </Box>
  );
}
