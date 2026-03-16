import { useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemText, Box, useMediaQuery, useTheme,
  Dialog, DialogContent, TextField, Alert, CircularProgress,
  Tabs, Tab, Divider, Avatar, Menu, MenuItem as MuiMenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { auth } from "../api";

const NAV_LINKS = [
  { label: "Artists", path: "/artists" },
  { label: "Albums", path: "/albums" },
  { label: "Tracks", path: "/tracks" },
  { label: "Playlists", path: "/playlists" },
];

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ open, onClose }) {
  const [tab, setTab] = useState(0); // 0 = login, 1 = register
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [regForm, setRegForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();

  const resetState = () => {
    setError("");
    setSuccess("");
    setLoading(false);
  };

  const handleTabChange = (_, v) => {
    setTab(v);
    resetState();
  };

  const handleLogin = async () => {
    if (!loginForm.username.trim() || !loginForm.password) {
      return setError("Username and password are required.");
    }
    try {
      setLoading(true);
      setError("");
      const res = await auth.login(loginForm.username, loginForm.password);
      const { access, refresh } = res.data;
      login(access, refresh, { username: loginForm.username });
      setLoginForm({ username: "", password: "" });
      onClose();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
        (typeof data === "object" ? Object.values(data).flat().join(" ") : "Login failed.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!regForm.username.trim()) return setError("Username is required.");
    if (!regForm.email.trim()) return setError("Email is required.");
    if (!regForm.password) return setError("Password is required.");
    if (regForm.password !== regForm.confirm) return setError("Passwords do not match.");
    try {
      setLoading(true);
      setError("");
      await auth.register(regForm.username, regForm.email, regForm.password);
      setSuccess("Account created! You can now log in.");
      setRegForm({ username: "", email: "", password: "", confirm: "" });
      setTimeout(() => {
        setTab(0);
        setSuccess("");
      }, 1800);
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === "object" ? Object.values(data).flat().join(" ") : "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      fontFamily: '"DM Mono", monospace',
      fontSize: "0.85rem",
      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
      "&:hover fieldset": { borderColor: "rgba(232,255,71,0.4)" },
      "&.Mui-focused fieldset": { borderColor: "primary.main", borderWidth: 1 },
    },
    "& .MuiInputLabel-root": {
      fontFamily: '"DM Mono", monospace',
      fontSize: "0.8rem",
      color: "text.secondary",
      "&.Mui-focused": { color: "primary.main" },
    },
    "& .MuiInputBase-input": { color: "text.primary" },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          background: "#0e0e0e",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "2px",
          overflow: "visible",
        },
      }}
    >
      {/* Top accent bar */}
      <Box sx={{ height: 2, background: "linear-gradient(90deg, transparent, #E8FF47, transparent)" }} />

      <DialogContent sx={{ p: 0 }}>
        {/* Header row */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 3, pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MusicNoteIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography sx={{ fontFamily: '"Anton", sans-serif', color: "primary.main", letterSpacing: "0.05em", fontSize: "1.1rem" }}>
              GRUNGE<span style={{ color: "#fff" }}>VAULT</span>
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{
            px: 3,
            "& .MuiTabs-indicator": { backgroundColor: "primary.main", height: 1 },
            "& .MuiTab-root": {
              fontFamily: '"DM Mono", monospace',
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              color: "text.secondary",
              minWidth: 0,
              px: 0,
              mr: 3,
              "&.Mui-selected": { color: "primary.main" },
            },
          }}
        >
          <Tab label="LOGIN" />
          <Tab label="REGISTER" />
        </Tabs>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 3 }} />

        {/* Forms */}
        <Box sx={{ px: 3, pt: 3, pb: 3 }}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                background: "rgba(211,47,47,0.1)",
                border: "1px solid rgba(211,47,47,0.3)",
                borderRadius: "2px",
                fontFamily: '"DM Mono", monospace',
                fontSize: "0.75rem",
                color: "#ff6b6b",
                "& .MuiAlert-icon": { color: "#ff6b6b" },
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                background: "rgba(232,255,71,0.08)",
                border: "1px solid rgba(232,255,71,0.3)",
                borderRadius: "2px",
                fontFamily: '"DM Mono", monospace',
                fontSize: "0.75rem",
                color: "#E8FF47",
                "& .MuiAlert-icon": { color: "#E8FF47" },
              }}
            >
              {success}
            </Alert>
          )}

          {tab === 0 ? (
            /* ── Login form ── */
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Username"
                fullWidth
                size="small"
                value={loginForm.username}
                onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                sx={inputSx}
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
                value={loginForm.password}
                onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                sx={inputSx}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                disabled={loading}
                sx={{
                  mt: 1,
                  fontFamily: '"DM Mono", monospace',
                  letterSpacing: "0.12em",
                  fontSize: "0.75rem",
                  borderRadius: "2px",
                  height: 42,
                }}
              >
                {loading ? <CircularProgress size={18} sx={{ color: "#080808" }} /> : "SIGN IN"}
              </Button>
              <Typography
                sx={{ textAlign: "center", color: "text.secondary", fontFamily: '"DM Mono", monospace', fontSize: "0.7rem" }}
              >
                No account?{" "}
                <Box
                  component="span"
                  onClick={() => { setTab(1); resetState(); }}
                  sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Register here
                </Box>
              </Typography>
            </Box>
          ) : (
            /* ── Register form ── */
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Username"
                fullWidth
                size="small"
                value={regForm.username}
                onChange={(e) => setRegForm((p) => ({ ...p, username: e.target.value }))}
                sx={inputSx}
                autoFocus
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                size="small"
                value={regForm.email}
                onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
                sx={inputSx}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
                value={regForm.password}
                onChange={(e) => setRegForm((p) => ({ ...p, password: e.target.value }))}
                sx={inputSx}
              />
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                size="small"
                value={regForm.confirm}
                onChange={(e) => setRegForm((p) => ({ ...p, confirm: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                sx={inputSx}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleRegister}
                disabled={loading}
                sx={{
                  mt: 1,
                  fontFamily: '"DM Mono", monospace',
                  letterSpacing: "0.12em",
                  fontSize: "0.75rem",
                  borderRadius: "2px",
                  height: 42,
                }}
              >
                {loading ? <CircularProgress size={18} sx={{ color: "#080808" }} /> : "CREATE ACCOUNT"}
              </Button>
              <Typography
                sx={{ textAlign: "center", color: "text.secondary", fontFamily: '"DM Mono", monospace', fontSize: "0.7rem" }}
              >
                Already have one?{" "}
                <Box
                  component="span"
                  onClick={() => { setTab(0); resetState(); }}
                  sx={{ color: "primary.main", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                >
                  Sign in
                </Box>
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "rgba(8,8,8,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 }, minHeight: 64 }}>
          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none", flexGrow: 1 }}
          >
            <MusicNoteIcon sx={{ color: "primary.main", fontSize: 28 }} />
            <Typography
              variant="h5"
              sx={{
                color: "primary.main",
                fontFamily: '"Anton", sans-serif',
                letterSpacing: "0.05em",
                lineHeight: 1,
              }}
            >
              GRUNGE<span style={{ color: "#fff" }}>VAULT</span>
            </Typography>
          </Box>

          {/* Desktop Nav */}
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              {NAV_LINKS.map((link) => {
                const active = location.pathname.startsWith(link.path);
                return (
                  <Button
                    key={link.path}
                    component={Link}
                    to={link.path}
                    sx={{
                      color: active ? "primary.main" : "text.secondary",
                      fontFamily: '"DM Mono", monospace',
                      fontSize: "0.75rem",
                      letterSpacing: "0.1em",
                      px: 2,
                      "&:hover": { color: "primary.main", background: "rgba(232,255,71,0.05)" },
                      borderBottom: active ? "2px solid" : "2px solid transparent",
                      borderColor: active ? "primary.main" : "transparent",
                      borderRadius: 0,
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}

              {/* Auth button — desktop */}
              <Box sx={{ ml: 1, borderLeft: "1px solid rgba(255,255,255,0.08)", pl: 1.5 }}>
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                      startIcon={
                        <Avatar sx={{ width: 22, height: 22, bgcolor: "primary.main", color: "#080808", fontSize: "0.7rem", fontWeight: 700 }}>
                          {user?.username?.[0]?.toUpperCase() ?? "U"}
                        </Avatar>
                      }
                      sx={{
                        color: "text.secondary",
                        fontFamily: '"DM Mono", monospace',
                        fontSize: "0.72rem",
                        letterSpacing: "0.08em",
                        "&:hover": { color: "primary.main", background: "rgba(232,255,71,0.05)" },
                      }}
                    >
                      {user?.username ?? "Account"}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => setAnchorEl(null)}
                      PaperProps={{
                        sx: {
                          background: "#111",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "2px",
                          minWidth: 160,
                        },
                      }}
                    >
                      <MuiMenuItem
                        onClick={() => { logout(); setAnchorEl(null); }}
                        sx={{
                          fontFamily: '"DM Mono", monospace',
                          fontSize: "0.75rem",
                          letterSpacing: "0.1em",
                          color: "text.secondary",
                          gap: 1.5,
                          "&:hover": { color: "#ff6b6b", background: "rgba(255,107,107,0.05)" },
                        }}
                      >
                        <LogoutIcon fontSize="small" />
                        SIGN OUT
                      </MuiMenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button
                    onClick={() => setAuthOpen(true)}
                    startIcon={<LoginIcon sx={{ fontSize: "16px !important" }} />}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: "rgba(232,255,71,0.4)",
                      color: "primary.main",
                      fontFamily: '"DM Mono", monospace',
                      fontSize: "0.7rem",
                      letterSpacing: "0.12em",
                      borderRadius: "2px",
                      px: 2,
                      "&:hover": {
                        borderColor: "primary.main",
                        background: "rgba(232,255,71,0.06)",
                      },
                    }}
                  >
                    LOGIN
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {/* Mobile: user avatar + hamburger */}
          {isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isAuthenticated ? (
                <IconButton
                  size="small"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ p: 0.5 }}
                >
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", color: "#080808", fontSize: "0.75rem", fontWeight: 700 }}>
                    {user?.username?.[0]?.toUpperCase() ?? "U"}
                  </Avatar>
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  onClick={() => setAuthOpen(true)}
                  sx={{ color: "primary.main" }}
                >
                  <PersonIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "text.primary" }}>
                <MenuIcon />
              </IconButton>
              {/* Mobile user menu */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                  sx: {
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "2px",
                    minWidth: 160,
                  },
                }}
              >
                <MuiMenuItem disabled sx={{ fontFamily: '"DM Mono", monospace', fontSize: "0.7rem", opacity: 0.5 }}>
                  {user?.username}
                </MuiMenuItem>
                <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                <MuiMenuItem
                  onClick={() => { logout(); setAnchorEl(null); }}
                  sx={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    color: "text.secondary",
                    gap: 1.5,
                    "&:hover": { color: "#ff6b6b", background: "rgba(255,107,107,0.05)" },
                  }}
                >
                  <LogoutIcon fontSize="small" />
                  SIGN OUT
                </MuiMenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 240, background: "#111", borderLeft: "1px solid rgba(255,255,255,0.08)" },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ color: "primary.main", mb: 2, fontFamily: '"Anton", sans-serif' }}
          >
            MENU
          </Typography>
          <List disablePadding>
            {NAV_LINKS.map((link) => (
              <ListItem
                key={link.path}
                component={Link}
                to={link.path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  color: location.pathname.startsWith(link.path) ? "primary.main" : "text.primary",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  "&:hover": { color: "primary.main", background: "rgba(232,255,71,0.04)" },
                }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontFamily: '"DM Mono", monospace', fontSize: "0.85rem", letterSpacing: "0.1em" }}
                />
              </ListItem>
            ))}
            {/* Login option in drawer if not authenticated */}
            {!isAuthenticated && (
              <ListItem
                onClick={() => { setDrawerOpen(false); setAuthOpen(true); }}
                sx={{
                  color: "primary.main",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  "&:hover": { background: "rgba(232,255,71,0.04)" },
                }}
              >
                <LoginIcon sx={{ mr: 1, fontSize: 18 }} />
                <ListItemText
                  primary="Login / Register"
                  primaryTypographyProps={{ fontFamily: '"DM Mono", monospace', fontSize: "0.85rem", letterSpacing: "0.1em" }}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}