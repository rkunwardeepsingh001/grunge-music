import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Tooltip, Typography,
  Skeleton, Alert, Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function DataTable({ columns, rows, loading, error, onEdit, onDelete }) {
  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 1 }}>
        Failed to load data: {error}
      </Alert>
    );
  }

  return (
    <TableContainer
      sx={{
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 1,
        background: "#111",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.field}>{col.headerName}</TableCell>
            ))}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.field}>
                      <Skeleton variant="text" sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton variant="text" sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
                  </TableCell>
                </TableRow>
              ))
            : rows.length === 0
            ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 6 }}>
                  <Typography sx={{ color: "text.secondary", fontFamily: '"DM Mono", monospace', fontSize: "0.8rem" }}>
                    NO RECORDS FOUND
                  </Typography>
                </TableCell>
              </TableRow>
            )
            : rows.map((row) => (
              <TableRow
                key={row.id || row.uuid}
                sx={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  "&:hover": { background: "rgba(255,255,255,0.02)" },
                  "&:last-child td": { border: 0 },
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.field}
                    sx={{ color: col.primary ? "text.primary" : "text.secondary", fontSize: "0.85rem" }}
                  >
                    {col.render ? col.render(row[col.field], row) : (row[col.field] ?? "—")}
                  </TableCell>
                ))}
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                    {onEdit && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(row)}
                          sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "primary.main" } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(row)}
                          sx={{ color: "rgba(255,255,255,0.4)", "&:hover": { color: "secondary.main" } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
