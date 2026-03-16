import { useState, useEffect, useCallback } from "react";
import {
  Container, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Alert, Snackbar, MenuItem, Typography,
} from "@mui/material";
import AlbumIcon from "@mui/icons-material/Album";
import { albumsApi, artistsApi } from "../api";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";

const EMPTY_FORM = { name: "", year: new Date().getFullYear(), artist: "" };

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [albRes, artRes] = await Promise.all([albumsApi.getAll(), artistsApi.getAll()]);
      setAlbums(Array.isArray(albRes.data?.results ?? albRes.data) ? (albRes.data?.results ?? albRes.data) : []);
      setArtists(Array.isArray(artRes.data?.results ?? artRes.data) ? (artRes.data?.results ?? artRes.data) : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Use uuid as the key — Django lookup_field = "uuid", not numeric id
  const artistMap = Object.fromEntries(artists.map((a) => [a.uuid, a.name]));

  const openAdd = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (album) => {
    setEditing(album);
    // album.artist may be a uuid string or a nested object — normalise to uuid
    const artistUuid = album.artist?.uuid ?? album.artist;
    setFormData({ name: album.name, year: album.year, artist: artistUuid });
    setFormError("");
    setDialogOpen(true);
  };

  const handleChange = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));
const handleSave = async () => {
  if (!formData.name.trim()) return setFormError("Album name is required.");
  if (!formData.artist) return setFormError("Artist is required.");
  if (!formData.year || formData.year < 1900) return setFormError("Valid year is required.");
  try {
    setSaving(true);
    // Send artist_uuid — NOT artist — that's what Django's serializer expects
    const payload = {
      name: formData.name,
      year: Number(formData.year),
      artist_uuid: formData.artist,
    };
    if (editing) {
      await albumsApi.patch(editing.uuid, payload);
      setSnack({ open: true, message: "Album updated.", severity: "success" });
    } else {
      await albumsApi.create(payload);
      setSnack({ open: true, message: "Album created.", severity: "success" });
    }
    setDialogOpen(false);
    fetchAll();
  } catch (err) {
    const errData = err.response?.data;
    setFormError(typeof errData === "object" ? Object.values(errData).flat().join(" ") : err.message);
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await albumsApi.delete(deleteTarget.uuid);
      setSnack({ open: true, message: "Album deleted.", severity: "info" });
      setDeleteTarget(null);
      fetchAll();
    } catch {
      setSnack({ open: true, message: "Failed to delete.", severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: "name", headerName: "Album Name", primary: true },
    {
      field: "year", headerName: "Year",
      render: (v) => (
        <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: "0.85rem", color: "primary.main" }}>{v}</Typography>
      ),
    },
    {
      field: "artist", headerName: "Artist",
      render: (v) => {
        const key = v?.uuid ?? v;
        return artistMap[key] || key || "—";
      },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader title="ALBUMS" subtitle={`${albums.length} records`} onAdd={openAdd} addLabel="Add Album" />
      <DataTable columns={columns} rows={albums} loading={loading} error={error} onEdit={openEdit} onDelete={setDeleteTarget} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AlbumIcon sx={{ color: "primary.main" }} />
          {editing ? "Edit Album" : "New Album"}
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important", display: "flex", flexDirection: "column", gap: 2 }}>
          {formError && <Alert severity="error" sx={{ borderRadius: 1 }}>{formError}</Alert>}
          <TextField label="Album Name" fullWidth value={formData.name} onChange={handleChange("name")} autoFocus />
          <TextField
            label="Release Year" type="number" fullWidth
            value={formData.year} onChange={handleChange("year")}
            inputProps={{ min: 1900, max: 9999 }}
          />
          {/* MenuItem value is artist.uuid — matches what Django expects */}
          <TextField label="Artist" select fullWidth value={formData.artist} onChange={handleChange("artist")}>
            <MenuItem value=""><em>Select artist…</em></MenuItem>
            {artists.map((a) => (
              <MenuItem key={a.uuid} value={a.uuid}>{a.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: "text.secondary" }}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Album"
        message={`Delete "${deleteTarget?.name}"? All tracks will also be removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Container>
  );
}
