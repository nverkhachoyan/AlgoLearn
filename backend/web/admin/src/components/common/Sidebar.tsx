import { Box } from "@mui/material";
import { Menu } from "react-admin";

export const Sidebar = () => (
  <Box>
    <Box sx={{ padding: 1.5 }} />
    <Menu>
      <Menu.DashboardItem />
      <Menu.ResourceItem name="courses" />
      <Menu.ResourceItem name="users" />
    </Menu>
  </Box>
);
