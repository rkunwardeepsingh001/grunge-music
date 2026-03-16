import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#E8FF47",      // acid yellow-green
      contrastText: "#0a0a0a",
    },
    secondary: {
      main: "#FF4757",      // punky red
      contrastText: "#fff",
    },
    background: {
      default: "#080808",
      paper: "#111111",
    },
    text: {
      primary: "#F0EDE8",
      secondary: "#888888",
    },
    divider: "rgba(255,255,255,0.08)",
  },
  typography: {
    fontFamily: '"DM Mono", "Courier New", monospace',
    h1: {
      fontFamily: '"Anton", "Impact", sans-serif',
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: '"Anton", "Impact", sans-serif',
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: '"Anton", "Impact", sans-serif',
    },
    h4: {
      fontFamily: '"Anton", "Impact", sans-serif',
    },
    h5: { fontFamily: '"Anton", "Impact", sans-serif' },
    h6: { fontFamily: '"Anton", "Impact", sans-serif' },
    button: {
      fontFamily: '"DM Mono", monospace',
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
  },
  shape: { borderRadius: 2 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: "8px 20px",
        },
        containedPrimary: {
          color: "#0a0a0a",
          fontWeight: 700,
          "&:hover": { backgroundColor: "#d4eb00" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(255,255,255,0.06)",
          backgroundImage: "none",
          transition: "border-color 0.2s, transform 0.2s",
          "&:hover": {
            borderColor: "rgba(232,255,71,0.3)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 2 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: "1px solid rgba(255,255,255,0.1)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
            "&:hover fieldset": { borderColor: "rgba(232,255,71,0.5)" },
            "&.Mui-focused fieldset": { borderColor: "#E8FF47" },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            color: "#E8FF47",
            borderBottom: "1px solid rgba(232,255,71,0.2)",
            fontFamily: '"DM Mono", monospace',
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          },
        },
      },
    },
  },
});

export default theme;
