import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <WarningAmberIcon sx={{ color: "secondary.main" }} />
        <Typography variant="h6" component="span">
          {title || "Confirm Delete"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "text.secondary", fontFamily: '"DM Mono", monospace', fontSize: "0.85rem" }}>
          {message || "Are you sure you want to delete this item? This action cannot be undone."}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onCancel} sx={{ color: "text.secondary" }} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="secondary"
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
