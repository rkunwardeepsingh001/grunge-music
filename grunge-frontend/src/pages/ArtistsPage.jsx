import { useState, useEffect, useCallback } from "react";
import {
  Container, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, TextField, Typography, Alert, Snackbar,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import { artistsApi } from "../api";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";

const EMPTY_FORM = { name: "" };

export default function ArtistsPage() {
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

  const fetchArtists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await artistsApi.getAll();
      // Handle both paginated (results array) and plain array responses
      const data = res.data?.results ?? res.data;
      setArtists(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArtists(); }, [fetchArtists]);

  const openAdd = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (artist) => {
    setEditing(artist);
    setFormData({ name: artist.name });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormError("Artist name is required.");
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await artistsApi.patch(editing.uuid, formData);
        setSnack({ open: true, message: "Artist updated.", severity: "success" });
      } else {
        await artistsApi.create(formData);
        setSnack({ open: true, message: "Artist created.", severity: "success" });
      }
      setDialogOpen(false);
      fetchArtists();
    } catch (err) {
      setFormError(err.response?.data?.name?.[0] || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await artistsApi.delete(deleteTarget.uuid);
      setSnack({ open: true, message: "Artist deleted.", severity: "info" });
      setDeleteTarget(null);
      fetchArtists();
    } catch (err) {
      setSnack({ open: true, message: "Failed to delete.", severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { field: "name", headerName: "Artist Name", primary: true },
    { field: "uuid", headerName: "UUID", render: (v) => (
      <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: "0.7rem", color: "rgba(255,255,255,0.25)" }}>
        {v}
      </Typography>
    )},
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="ARTISTS"
        subtitle={`${artists.length} records`}
        onAdd={openAdd}
        addLabel="Add Artist"
      />

      <DataTable
        columns={columns}
        rows={artists}
        loading={loading}
        error={error}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MicIcon sx={{ color: "primary.main" }} />
          {editing ? "Edit Artist" : "New Artist"}
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{formError}</Alert>
          )}
          <TextField
            label="Artist Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Artist"
        message={`Delete "${deleteTarget?.name}"? All associated albums and tracks will also be removed.`}
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
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
