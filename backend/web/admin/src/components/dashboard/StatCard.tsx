import { Card, CardContent, Typography, useTheme } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface StatCardProps {
  title: string;
  value: number;
  icon: SvgIconComponent;
}

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        minWidth: 100,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: 3,
        }}
      >
        <Icon
          sx={{
            fontSize: 40,
            color: theme.palette.primary.main,
            marginBottom: 2,
          }}
        />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h6">{value}</Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;
