import { useState, useEffect, useCallback } from "react";
import {
  Container, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Alert, Snackbar, Typography, Box,
  Autocomplete, List, ListItem, ListItemText, IconButton, Divider,
} from "@mui/material";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CloseIcon from "@mui/icons-material/Close";
import { playlistsApi, tracksApi } from "../api";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";

const EMPTY_FORM = { name: "", tracks: [] };

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [allTracks, setAllTracks] = useState([]);
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
      const [plRes, trRes] = await Promise.all([playlistsApi.getAll(), tracksApi.getAll()]);
      setPlaylists(Array.isArray(plRes.data?.results ?? plRes.data) ? (plRes.data?.results ?? plRes.data) : []);
      setAllTracks(Array.isArray(trRes.data?.results ?? trRes.data) ? (trRes.data?.results ?? trRes.data) : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // uuid-keyed map for track names
  const trackMap = Object.fromEntries(allTracks.map((t) => [t.uuid, t]));

  const openAdd = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (playlist) => {
    setEditing(playlist);
    // tracks may be an array of uuid strings or objects
    const trackUuids = (playlist.tracks || []).map((t) => t?.uuid ?? t);
    setFormData({ name: playlist.name, tracks: trackUuids });
    setFormError("");
    setDialogOpen(true);
  };

  const removeTrack = (uuid) => {
    setFormData((p) => ({ ...p, tracks: p.tracks.filter((t) => t !== uuid) }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return setFormError("Playlist name is required.");
    try {
      setSaving(true);
      const payload = { name: formData.name, tracks: formData.tracks };
      if (editing) {
        await playlistsApi.patch(editing.uuid, payload);
        setSnack({ open: true, message: "Playlist updated.", severity: "success" });
      } else {
        await playlistsApi.create(payload);
        setSnack({ open: true, message: "Playlist created.", severity: "success" });
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
      await playlistsApi.delete(deleteTarget.uuid);
      setSnack({ open: true, message: "Playlist deleted.", severity: "info" });
      setDeleteTarget(null);
      fetchAll();
    } catch {
      setSnack({ open: true, message: "Failed to delete.", severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: "name", headerName: "Playlist Name", primary: true },
    {
      field: "tracks", headerName: "Tracks",
      render: (v) => (
        <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: "0.75rem", color: "primary.main" }}>
          {Array.isArray(v) ? v.length : 0} tracks
        </Typography>
      ),
    },
  ];

  // Tracks not yet in the current playlist form
  const availableTracks = allTracks.filter((t) => !formData.tracks.includes(t.uuid));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader title="PLAYLISTS" subtitle={`${playlists.length} records`} onAdd={openAdd} addLabel="New Playlist" />
      <DataTable columns={columns} rows={playlists} loading={loading} error={error} onEdit={openEdit} onDelete={setDeleteTarget} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <QueueMusicIcon sx={{ color: "primary.main" }} />
          {editing ? "Edit Playlist" : "New Playlist"}
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important", display: "flex", flexDirection: "column", gap: 2 }}>
          {formError && <Alert severity="error" sx={{ borderRadius: 1 }}>{formError}</Alert>}

          <TextField
            label="Playlist Name" fullWidth autoFocus
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
          />

          {/* Track autocomplete — keyed by uuid */}
          <Autocomplete
            options={availableTracks}
            getOptionLabel={(t) => t.name || ""}
            onChange={(_, val) => {
              if (val) setFormData((p) => ({ ...p, tracks: [...p.tracks, val.uuid] }));
            }}
            renderInput={(params) => <TextField {...params} label="Add track…" />}
            value={null}
            blurOnSelect
          />

          {/* Ordered track list */}
          {formData.tracks.length > 0 && (
            <Box sx={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 1, maxHeight: 240, overflowY: "auto" }}>
              <List dense disablePadding>
                {formData.tracks.map((uuid, idx) => {
                  const track = trackMap[uuid];
                  return (
                    <Box key={uuid}>
                      {idx > 0 && <Divider sx={{ borderColor: "rgba(255,255,255,0.04)" }} />}
                      <ListItem
                        secondaryAction={
                          <IconButton size="small" onClick={() => removeTrack(uuid)}
                            sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "secondary.main" } }}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        }
                        sx={{ py: 0.5 }}
                      >
                        <DragIndicatorIcon sx={{ color: "rgba(255,255,255,0.15)", mr: 1, fontSize: 16 }} />
                        <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: "0.7rem", color: "primary.main", mr: 1, minWidth: 24 }}>
                          {String(idx + 1).padStart(2, "0")}
                        </Typography>
                        <ListItemText
                          primary={track?.name || uuid}
                          primaryTypographyProps={{ fontSize: "0.85rem", color: "text.primary" }}
                        />
                      </ListItem>
                    </Box>
                  );
                })}
              </List>
            </Box>
          )}
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
        title="Delete Playlist"
        message={`Delete "${deleteTarget?.name}"?`}
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
