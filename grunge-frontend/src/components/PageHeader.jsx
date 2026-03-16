import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export default function PageHeader({ title, subtitle, onAdd, addLabel = "Add New" }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        mb: 4,
        pb: 3,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            color: "text.primary",
            fontSize: { xs: "2rem", md: "2.5rem" },
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              color: "text.secondary",
              fontFamily: '"DM Mono", monospace',
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {onAdd && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
        >
          {addLabel}
        </Button>
      )}
    </Box>
  );
}
