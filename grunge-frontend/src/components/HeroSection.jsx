import { Box, Typography, Button, Container, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import AlbumIcon from "@mui/icons-material/Album";
import MicIcon from "@mui/icons-material/Mic";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";

const STATS = [
  { icon: <MicIcon />, label: "Artists" },
  { icon: <AlbumIcon />, label: "Albums" },
  { icon: <GraphicEqIcon />, label: "Tracks" },
  { icon: <QueueMusicIcon />, label: "Playlists" },
];

export default function HeroSection() {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "#080808",
      }}
    >
      {/* Noise texture overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Giant background text */}
      <Typography
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: '"Anton", sans-serif',
          fontSize: { xs: "22vw", md: "18vw" },
          color: "rgba(255,255,255,0.025)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "-0.04em",
          zIndex: 0,
          lineHeight: 1,
        }}
      >
        GRUNGE
      </Typography>

      {/* Accent line */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, #E8FF47, transparent)",
        }}
      />

      {/* Diagonal accent block */}
      <Box
        sx={{
          position: "absolute",
          right: { xs: "-20%", md: "5%" },
          top: "15%",
          width: { xs: "60vw", md: "35vw" },
          height: { xs: "60vw", md: "35vw" },
          border: "1px solid rgba(232,255,71,0.08)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 1,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "12%",
            border: "1px solid rgba(232,255,71,0.05)",
            borderRadius: "50%",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "30%",
            background: "radial-gradient(circle, rgba(232,255,71,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, pt: 12, pb: 8 }}>
        <Stack spacing={4} maxWidth={700}>
          {/* Eyebrow */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 2,
                background: "primary.main",
                bgcolor: "primary.main",
              }}
            />
            <Typography
              sx={{
                color: "primary.main",
                fontFamily: '"DM Mono", monospace',
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Music Management System
            </Typography>
          </Box>

          {/* Headline */}
          <Box>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3.5rem", sm: "5rem", md: "7rem" },
                lineHeight: 0.9,
                color: "#F0EDE8",
                mb: 0.5,
              }}
            >
              YOUR
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3.5rem", sm: "5rem", md: "7rem" },
                lineHeight: 0.9,
                color: "primary.main",
                WebkitTextStroke: "0px",
                mb: 0.5,
              }}
            >
              MUSIC
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3.5rem", sm: "5rem", md: "7rem" },
                lineHeight: 0.9,
                color: "transparent",
                WebkitTextStroke: "1px rgba(240,237,232,0.4)",
              }}
            >
              VAULT
            </Typography>
          </Box>

          {/* Description */}
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: 480,
              fontFamily: '"DM Mono", monospace',
            }}
          >
            Manage artists, albums, tracks, and playlists — all from one place.
            Built on a Django REST backend with a full CRUD interface.
          </Typography>

          {/* CTA Buttons */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} pt={1}>
            <Button
              component={Link}
              to="/artists"
              variant="contained"
              color="primary"
              size="large"
              sx={{ fontWeight: 700, px: 4 }}
            >
              Explore Artists
            </Button>
            <Button
              component={Link}
              to="/playlists"
              variant="outlined"
              size="large"
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "text.primary",
                "&:hover": {
                  borderColor: "primary.main",
                  color: "primary.main",
                  background: "rgba(232,255,71,0.04)",
                },
                px: 4,
              }}
            >
              View Playlists
            </Button>
          </Stack>

          {/* Stats row */}
          <Stack
            direction="row"
            spacing={0}
            sx={{
              mt: 4,
              pt: 4,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            {STATS.map((stat) => (
              <Box key={stat.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ color: "primary.main", display: "flex", fontSize: 18 }}>
                  {stat.icon}
                </Box>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontFamily: '"DM Mono", monospace',
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
