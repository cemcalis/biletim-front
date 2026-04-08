import Link from "next/link";
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

export type CompanySidebarProps = {
  active: "overview" | "vehicles" | "trips";
  onLogout: () => void;
};

const items = [
  { label: "Genel Bakış", href: "#overview", key: "overview" as const },
  { label: "Araçlar", href: "#vehicles", key: "vehicles" as const },
  { label: "Seferler", href: "#trips", key: "trips" as const },
];

export function CompanySidebar({ active, onLogout }: CompanySidebarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid #dbe3f1",
        boxShadow: "none",
        position: "sticky",
        top: 16,
        bgcolor: "#fff",
      }}
    >
      <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "#13223f" }}>
        Sidebar Menü
      </Typography>
      <Typography sx={{ mt: 0.75, fontSize: "0.82rem", color: "#5d6c87" }}>
        Hızlı erişim ve yönetim araçları
      </Typography>

      <List disablePadding sx={{ mt: 2, display: "grid", gap: 1 }}>
        {items.map((item) => {
          const selected = active === item.key;
          return (
            <ListItemButton
              key={item.key}
              component={Link}
              href={item.href}
              selected={selected}
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: selected ? "#c9d8ff" : "#e5eaf2",
                bgcolor: selected ? "#eaf0ff" : "#f6f8fc",
                "&.Mui-selected": {
                  bgcolor: "#eaf0ff",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "#dfe9ff",
                },
              }}
            >
              <ListItemText
                primary={item.label}
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    color: selected ? "#2a64e8" : "#24324f",
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: 2.5, display: "grid", gap: 1 }}>
        <Button
          component={Link}
          href="/company/register"
          variant="outlined"
          sx={{ textTransform: "none", borderColor: "#d8deec", color: "#24324f" }}
        >
          Firma başvurusu
        </Button>
        <Button
          onClick={onLogout}
          variant="contained"
          disableElevation
          sx={{ textTransform: "none", bgcolor: "#101d35", boxShadow: "none" }}
        >
          Çıkış Yap
        </Button>
      </Box>
    </Paper>
  );
}
