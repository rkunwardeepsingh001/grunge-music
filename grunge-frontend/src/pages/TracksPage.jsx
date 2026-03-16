import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Snackbar,
  MenuItem,
  Typography,
} from "@mui/material";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { tracksApi, albumsApi } from "../api";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";

const EMPTY_FORM = { name: "", album: "", number: 1 };

export default function TracksPage() {
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [trRes, albRes] = await Promise.all([
        tracksApi.getAll(),
        albumsApi.getAll(),
      ]);
      setTracks(
        Array.isArray(trRes.data?.results ?? trRes.data)
          ? (trRes.data?.results ?? trRes.data)
          : [],
      );
      setAlbums(
        Array.isArray(albRes.data?.results ?? albRes.data)
          ? (albRes.data?.results ?? albRes.data)
          : [],
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // uuid-keyed map for album names
  const albumMap = Object.fromEntries(albums.map((a) => [a.uuid, a.name]));

  const openAdd = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (track) => {
    setEditing(track);
    const albumUuid = track.album?.uuid ?? track.album;
    setFormData({ name: track.name, album: albumUuid, number: track.number });
    setFormError("");
    setDialogOpen(true);
  };

  const handleChange = (field) => (e) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    if (!formData.name.trim()) return setFormError("Track name is required.");
    if (!formData.album) return setFormError("Album is required.");
    if (!formData.number || formData.number < 1)
      return setFormError("Valid track number required.");
    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        number: Number(formData.number),
        album_uuid: formData.album,
      };
      if (editing) {
        await tracksApi.patch(editing.uuid, payload);
        setSnack({
          open: true,
          message: "Track updated.",
          severity: "success",
        });
      } else {
        await tracksApi.create(payload);
        setSnack({
          open: true,
          message: "Track created.",
          severity: "success",
        });
      }
      setDialogOpen(false);
      fetchAll();
    } catch (err) {
      const errData = err.response?.data;
      setFormError(
        typeof errData === "object"
          ? Object.values(errData).flat().join(" ")
          : err.message,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await tracksApi.delete(deleteTarget.uuid);
      setSnack({ open: true, message: "Track deleted.", severity: "info" });
      setDeleteTarget(null);
      fetchAll();
    } catch {
      setSnack({ open: true, message: "Failed to delete.", severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      field: "number",
      headerName: "#",
      render: (v) => (
        <Typography
          sx={{
            fontFamily: '"DM Mono", monospace',
            fontSize: "0.75rem",
            color: "primary.main",
          }}
        >
          {String(v).padStart(2, "0")}
        </Typography>
      ),
    },
    { field: "name", headerName: "Track Name", primary: true },
    {
      field: "album",
      headerName: "Album",
      render: (v) => {
        const key = v?.uuid ?? v;
        return albumMap[key] || key || "—";
      },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="TRACKS"
        subtitle={`${tracks.length} records`}
        onAdd={openAdd}
        addLabel="Add Track"
      />
      <DataTable
        columns={columns}
        rows={tracks}
        loading={loading}
        error={error}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MusicNoteIcon sx={{ color: "primary.main" }} />
          {editing ? "Edit Track" : "New Track"}
        </DialogTitle>
        <DialogContent
          sx={{
            pt: "16px !important",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {formError && (
            <Alert severity="error" sx={{ borderRadius: 1 }}>
              {formError}
            </Alert>
          )}
          <TextField
            label="Track Name"
            fullWidth
            value={formData.name}
            onChange={handleChange("name")}
            autoFocus
          />
          <TextField
            label="Album"
            select
            fullWidth
            value={formData.album}
            onChange={handleChange("album")}
          >
            <MenuItem value="">
              <em>Select album…</em>
            </MenuItem>
            {albums.map((a) => (
              <MenuItem key={a.uuid} value={a.uuid}>
                {a.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Track Number"
            type="number"
            fullWidth
            value={formData.number}
            onChange={handleChange("number")}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Track"
        message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
