import { Typography, Grid, Box } from "@mui/material";
import { Resource, useDataProvider } from "react-admin";
import { UserList } from "../components/resources/UserList";
import { useEffect, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import StatCard from "../components/dashboard/StatCard";

export const Dashboard = () => {
  const [counts, setCounts] = useState({
    users: 0,
    courses: 0,
    units: 0,
    modules: 0,
  });
  const dataProvider = useDataProvider();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [users, courses, units, modules] = await Promise.all([
          dataProvider.getOne("users", { id: "count" }),
          dataProvider.getOne("courses", { id: "count" }),
          dataProvider.getOne("units", { id: "count" }),
          dataProvider.getOne("modules", { id: "count" }),
        ]);

        setCounts({
          users: users?.data?.value ?? 0,
          courses: courses?.data?.value ?? 0,
          units: units?.data?.value ?? 0,
          modules: modules?.data?.value ?? 0,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, [dataProvider]);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography
        variant="h6"
        sx={{ marginTop: 2, marginBottom: 2, fontWeight: "bold" }}
      >
        Dashboard
      </Typography>

      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={counts.users}
            icon={PeopleIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Courses"
            value={counts.courses}
            icon={SchoolIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Units"
            value={counts.units}
            icon={LibraryBooksIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Modules"
            value={counts.modules}
            icon={MenuBookIcon}
          />
        </Grid>
      </Grid>

      <Typography
        variant="h6"
        sx={{ marginTop: 2, marginBottom: 2, fontWeight: "bold" }}
      >
        User Management
      </Typography>
      <Resource name="users" list={UserList} hasEdit={false} />
    </Box>
  );
};
