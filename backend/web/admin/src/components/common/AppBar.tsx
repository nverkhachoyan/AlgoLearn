import { AppBar as MuiAppBar, Toolbar } from "@mui/material";
import { TitlePortal, RefreshIconButton } from "react-admin";

export const AppBar = () => (
  <MuiAppBar color="primary">
    <Toolbar
      sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}
      color="primary"
      style={{ backgroundColor: "inherit" }}
    >
      <TitlePortal />

      <RefreshIconButton />
    </Toolbar>
  </MuiAppBar>
);
