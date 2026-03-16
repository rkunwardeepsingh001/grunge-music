import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import theme from "./theme";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import ArtistsPage from "./pages/ArtistsPage";
import AlbumsPage from "./pages/AlbumsPage";
import TracksPage from "./pages/TracksPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Header />
          <Box sx={{ minHeight: "100vh", background: "background.default" }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/artists" element={<Box sx={{ pt: 8 }}><ArtistsPage /></Box>} />
              <Route path="/albums" element={<Box sx={{ pt: 8 }}><AlbumsPage /></Box>} />
              <Route path="/tracks" element={<Box sx={{ pt: 8 }}><TracksPage /></Box>} />
              <Route path="/playlists" element={<Box sx={{ pt: 8 }}><PlaylistsPage /></Box>} />
            </Routes>
          </Box>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}