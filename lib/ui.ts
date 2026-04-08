export const paperHoverSx = {
  transition: "transform 180ms ease, border-color 180ms ease, background-color 180ms ease",
  willChange: "transform",
  "&:hover": {
    transform: "translateY(-4px)",
    borderColor: "#b9c7e6",
    bgcolor: "#fbfcff",
  },
};